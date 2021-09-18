import { getContext, Text, Grid, on, getWorldRect } from '../libs/kontra';
import {
  COLORS,
  GRID_SIZE,
  TEXT_PROPS,
  TYPES,
  COMPONENTS,
  RECIPES,
  GAME_WIDTH,
  GAME_HEIGHT,
  TICK_DURATION,
  COSTS,
  MINER_DURATIONS
} from '../constants';
import { titleCase } from '../utils';
import tileatlas from '../assets/tileatlas.json';
import ImageButton from './image-button';
import GameObject from '../utils/game-object';

let popupGrid;
let recipeGrid;
let name;
let closeBtn;

let textProps = {
  ...TEXT_PROPS,
  font: '14px Arial'
};

function minerText(name) {
  return `Produces 1 ${titleCase(name)} every ${
    MINER_DURATIONS[name]
  } seconds. Can only be placed in rooms with a minable resource tile.`;
}

let uiText = {
  BELT: 'Moves items along a path. Place on a wall at the end of a path to export items from a room, place on a wall at the start of a path to import items into a room. Select an import belt once placed to filter which items are imported into the room.',
  MOVER:
    'Moves items from behind the Mover to the building or belt in front of it. Select once placed to filter which items it moves.',
  REPAIRER:
    'Moves items from behind the Repairer to the docked ship. Can only be placed on the tiles next to the ship docking station.',
  'COPPER-MINER': minerText('COPPER'),
  'IRON-MINER': minerText('IRON'),
  'TITANIUM-MINER': minerText('TITANIUM'),
  'HYDROGEN-EXTRACTOR': minerText('HYDROGEN'),
  'OXYGEN-EXTRACTOR': minerText('OXYGEN'),
  ASSEMBLER:
    'Crafts items into more advanced items. Select once placed to choose which recipe to craft.'
};

function getRecipe(recipe) {
  let inputs =
    recipe.inputs?.map(({ name, total, has }) => {
      let btn = new ImageButton({
        name,
        width: GRID_SIZE,
        height: GRID_SIZE
      });

      if (total) {
        btn.addChild(
          Text({
            ...textProps,
            font: '12px Arial',
            anchor: { x: 0.5, y: 0 },
            strokeColor: COLORS.BLACK,
            x: GRID_SIZE - 4,
            y: GRID_SIZE * 1.75,
            text: has ? `0/${total}` : total
          })
        );
      }

      return btn;
    }) ?? [];

  let arrow = Text({
    ...textProps,
    font: '18px Arial',
    anchor: { x: 0.5, y: 0.5 },
    text: '→'
  });
  if (recipe.duration) {
    let duration = Text({
      ...textProps,
      font: '12px Arial',
      anchor: { x: 0.5, y: 0 },
      strokeColor: COLORS.BLACK,
      x: GRID_SIZE - 12,
      y: GRID_SIZE - 4,
      text: (recipe.duration * TICK_DURATION).toFixed(1) + 's'
    });
    arrow.addChild(duration);
  }
  // account for unicode character having lots of spacing
  arrow.width -= 7;

  let outputs =
    recipe.outputs?.map(({ name, total }) => {
      let btn = new ImageButton({
        name,
        width: GRID_SIZE,
        height: GRID_SIZE
      });

      if (total) {
        btn.addChild(
          Text({
            ...textProps,
            font: '12px Arial',
            anchor: { x: 0.5, y: 0 },
            strokeColor: COLORS.BLACK,
            x: GRID_SIZE - 4,
            y: GRID_SIZE * 1.75,
            text: `0/${total}`
          })
        );
      }

      return btn;
    }) ?? [];
  if (outputs.length) {
    outputs.unshift(arrow);
  }

  return [...inputs, ...outputs];
}

let buildingPopup = {
  hidden: true,
  width: GRID_SIZE * 10,
  height: GRID_SIZE * 10,
  padding: GRID_SIZE * 0.35,

  init() {
    name = Text({
      ...textProps,
      color: COLORS.BLACK
    });
    closeBtn = new ImageButton({
      anchor: { x: 1, y: 0 },
      width: GRID_SIZE * 2,
      height: GRID_SIZE * 2,
      name: 'DELETE_MENU',
      scaleX: 0.4,
      scaleY: 0.4,
      onDown() {
        buildingPopup.hide();
      }
    });
    popupGrid = Grid({
      flow: 'grid',
      rowGap: [GRID_SIZE / 2, GRID_SIZE],
      colGap: GRID_SIZE
    });
    recipeGrid = Grid({
      flow: 'grid',
      numCols: 5,
      align: 'center',
      rowGap: GRID_SIZE / 2,
      colGap: GRID_SIZE
    });

    on('esc', () => {
      this.hide();
    });
  },

  show(building, hasClose = true) {
    this.for = building;
    this.hidden = false;
    this.menuType = building.menuType;
    recipeGrid.children = [];

    let [ a, b, c, atlasHeight ] = tileatlas[building.name];
    this.hasClose = hasClose;
    popupGrid.hidden = false;

    let buildingName =
      building.name.split('_')[0] +
      (building.type === TYPES.BELT && building.name !== 'BELT' ? ' BELT' : '');

    name.text = titleCase(buildingName);

    // filter menu
    switch (building.menuType) {
      case TYPES.FILTER: {
        popupGrid.numCols = 5;
        let title = Text({
          ...textProps,
          colSpan: popupGrid.numCols,
          text: 'Filter:'
        });
        let components = ['NONE', ...COMPONENTS].map(name => {
          return new ImageButton({
            name,
            width: GRID_SIZE,
            height: GRID_SIZE,
            selected: name === building.filter,
            onDown() {
              building.filter = name;
              components.forEach(component => (component.selected = false));
              this.selected = true;
            }
          });
        });
        popupGrid.children = [title, ...components];
        break;
      }

      case TYPES.SHIP: {
        popupGrid.numCols = 10;
        let title = Text({
          ...textProps,
          colSpan: popupGrid.numCols,
          text: 'Needed for Repairs:'
        });
        let children = [];
        building.inputs.forEach(input => {
          let component = new GameObject({
            name: input.name
          });
          let text = Text({
            ...textProps,
            name: input.name,
            colSpan: popupGrid.numCols - 1,
            text: `0 / ${input.total}`
          });

          children.push(component, text);
        });
        popupGrid.children = [title, ...children];
        break;
      }

      case TYPES.RECIPE: {
        popupGrid.numCols = 5;
        recipeGrid.children = getRecipe(building.recipe);
        recipeGrid._p();

        let title = Text({
          ...textProps,
          colSpan: popupGrid.numCols,
          text: 'Recipe:'
        });
        let components = [...RECIPES].map(recipe => {
          return new ImageButton({
            name: recipe.name,
            width: GRID_SIZE,
            height: GRID_SIZE,
            selected: recipe.name === building.recipe.name,
            onDown() {
              building.setRecipe(recipe);
              recipeGrid.children = getRecipe(recipe);
              components.forEach(component => (component.selected = false));
              this.selected = true;
            }
          });
        });
        popupGrid.children = [title, ...components];
        break;
      }

      case TYPES.TIP: {
        popupGrid.hidden = true;
        name.text += ' Menu';
        break;
      }

      case TYPES.INFO: {
        popupGrid.numCols = 5;
        let title = Text({
          ...textProps,
          colSpan: recipeGrid.numCols,
          text: 'Cost:'
        });
        let recipe = {
          inputs: COSTS[buildingName]
        };
        let info = Text({
          ...textProps,
          width: this.width,
          colSpan: popupGrid.numCols,
          text: uiText[buildingName]
        });
        recipeGrid.children = [title, ...getRecipe(recipe)];
        recipeGrid._p();
        popupGrid.children = [info];
        break;
      }
    }

    // calculate height to know where to place the popup
    popupGrid._p();
    let { padding, width } = this;
    let bodyHeight = recipeGrid.children.length
      ? recipeGrid.height + GRID_SIZE * 2 + popupGrid.height
      : popupGrid.height;
    this.height =
      padding * 1.5 + GRID_SIZE * 1.5 + (!popupGrid.hidden ? bodyHeight : 0);

    let rect = getWorldRect(building);
    let sx = building.col ? (building.col + 2) * GRID_SIZE : rect.x;
    let sy = building.row
      ? (building.row - 0.5 * (atlasHeight - 1)) * GRID_SIZE
      : rect.y + GRID_SIZE / 2;
    this.x =
      sx + this.width < GAME_WIDTH ? sx : sx - 4 * GRID_SIZE - this.width;
    this.y =
      sy + this.height < GAME_HEIGHT
        ? sy
        : sy - this.height + atlasHeight * GRID_SIZE * 0.5;
    if (this.menuType === TYPES.INFO) {
      this.y -= GRID_SIZE * 2.5;
    } else if (this.menuType === TYPES.TIP) {
      this.y -= GRID_SIZE;
    }

    let { x, y } = this;
    name.x = popupGrid.x = recipeGrid.x = x;
    name.y = y + GRID_SIZE * 0.35;

    if (hasClose) {
      closeBtn.enable();
      closeBtn.x = x + width - GRID_SIZE / 4;
      closeBtn.y = y - GRID_SIZE * 0.15;
    } else {
      closeBtn.disable();
      closeBtn.x = closeBtn.y = -100;
    }

    if (recipeGrid.children.length) {
      recipeGrid.y = y + GRID_SIZE * 1.5;
      popupGrid.y = recipeGrid.y + recipeGrid.height + GRID_SIZE * 2;
    } else {
      popupGrid.y = y + GRID_SIZE * 1.5;
    }

    recipeGrid._p();
    popupGrid._p();
  },

  hide() {
    this.hidden = true;
  },

  update() {
    if (this.menuType === TYPES.SHIP) {
      popupGrid.children.forEach(child => {
        let input = this.for.inputs.find(input => {
          return input.name === child.name;
        });
        if (!input || !child.text) return;

        let text = `${input.has}/${input.total}`;
        if (child.text !== text) {
          child.text = text;
        }
      });
    } else if (this.menuType === TYPES.RECIPE) {
      let type = 'inputs';
      recipeGrid.children?.forEach(child => {
        if (child.name && child.name !== 'NONE') {
          let recipe = this.for.recipe[type]?.find(recipe => {
            return recipe.name === child.name;
          });
          let has =
            type === 'inputs'
              ? recipe.has
              : this.for.components.filter(
                  component => component.name === child.name
                ).length;

          let text = `${has}/${recipe.total}`;
          if (child.children[1].text !== text) {
            child.children[1].text = text;
          }
        } else {
          type = 'outputs';
        }
      });
    }
  },

  render() {
    if (this.hidden) return;

    let context = getContext();
    let { x, y, width, height, padding } = this;
    let sx = x - padding;
    let sy = y - padding;
    let swidth = width + padding * 2;
    let sheight = height + padding * 2;

    context.fillStyle = COLORS.WHITE;
    context.fillRect(sx, sy, swidth, GRID_SIZE * 1.35);

    context.fillStyle = COLORS.BLACK;
    context.strokeStyle = COLORS.WHITE;
    context.lineWidth = 1.5;

    name.render();

    if (this.hasClose) {
      closeBtn.render();
    }

    if (!popupGrid.hidden) {
      context.fillRect(sx, sy + GRID_SIZE * 1.35, swidth, sheight - GRID_SIZE);
      context.strokeRect(sx, sy, swidth, sheight);
      recipeGrid.render();
      popupGrid.render();
    }
  }
};
export default buildingPopup;
