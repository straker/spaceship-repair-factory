import { getContext, Text, Grid, Button, onInput, getWorldRect } from '../libs/kontra.js';
import {
  COLORS,
  GRID_SIZE,
  TEXT_PROPS,
  GAME_WIDTH,
  GAME_HEIGHT
} from '../constants.js';
import { recipes } from '../data/items.js';
import ImageButton from './image-button.js';

let popupGrid;
let recipeGrid;
let name;
let recipeName;
let closeBtn;

const textProps = {
  ...TEXT_PROPS,
  font: '14px Arial'
};

const buildingPopup = {
  hidden: true,
  width: GRID_SIZE * 10,
  height: GRID_SIZE * 10,
  padding: GRID_SIZE * 0.35,

  init() {
    name = Text({
      ...textProps,
      color: COLORS.black
    });
    recipeName = Text({
      ...textProps,
      colSpan: 5
    });
    closeBtn = new Button({
    // closeBtn = new ImageButton({
      anchor: { x: 1, y: 0 },
      width: GRID_SIZE * 2,
      height: GRID_SIZE * 2,
      text: {
        ...textProps,
        color: COLORS.black,
        x: -GRID_SIZE,
        y: GRID_SIZE / 2,
        text: 'Close'
      },
      // scaleX: 0.4,
      // scaleY: 0.4,
      onDown() {
        buildingPopup.hide();
      }
    });
    popupGrid = Grid({
      flow: 'grid',
      rowGap: GRID_SIZE * 1.5,
      colGap: GRID_SIZE * 1.1
    });
    recipeGrid = Grid({
      flow: 'grid',
      numCols: 5,
      align: 'center',
      rowGap: GRID_SIZE / 2,
      colGap: GRID_SIZE / 2
    });

    onInput(['esc'], () => {
      this.hide();
    });
  },

  show(building, hasClose = true) {
    if (!this.hidden) return;

    this.for = building;
    this.hidden = false;
    // this.menuType = building.menuType;
    recipeGrid.children = [];

    this.hasClose = hasClose;
    popupGrid.hidden = false;

    name.text = building.name;

    // 


    // filter menu
    // switch (building.menuType) {
    //   case TYPES.FILTER: {
    //     popupGrid.numCols = 5;
    //     let title = Text({
    //       ...textProps,
    //       colSpan: popupGrid.numCols,
    //       text: 'Filter:'
    //     });
    //     let components = ['NONE', ...COMPONENTS].map(name => {
    //       return new ImageButton({
    //         name,
    //         width: GRID_SIZE,
    //         height: GRID_SIZE,
    //         selected: name === building.filter,
    //         onDown() {
    //           building.filter = name;
    //           components.forEach(component => (component.selected = false));
    //           this.selected = true;
    //         }
    //       });
    //     });
    //     popupGrid.children = [title, ...components];
    //     break;
    //   }

    //   case TYPES.RECIPE: {
        popupGrid.numCols = 5;
        recipeGrid.children = getRecipe(building.recipe);
        recipeGrid._p();

        let title = Text({
          ...textProps,
          colSpan: popupGrid.numCols,
          text: 'Recipe:'
        });
        const allowedRecipes = Object.entries(recipes)
          .filter(([,recipe]) => recipe.craftedBy && recipe.craftedBy.includes(building.id));
        let components = allowedRecipes.map(([,recipe]) => {
          return new ImageButton({
            name: recipe.name,
            width: GRID_SIZE,
            height: GRID_SIZE,
            text: {
              text: recipe.name,
              width: GRID_SIZE * 1.1,
              y: GRID_SIZE * 1.5,
              ...textProps
            },
            selected: recipe.name === building.recipe?.name,
            onDown() {
              // TODO: do not allow selecting the same recipe that is already selected
              recipeGrid.children.forEach(child => child.destroy?.());
              building.setRecipe(recipe);
              recipeGrid.children = getRecipe(recipe);
              components.forEach(component => (component.selected = false));
              this.selected = true;
            }
          });
        });
        popupGrid.children = [title, ...components];
        // break;
    //   }
    // }

    // calculate height to know where to place the popup
    popupGrid._p();
    let { padding, width } = this;
    let bodyHeight = recipeGrid.children.length
      ? recipeGrid.height + GRID_SIZE * 2 + popupGrid.height
      : popupGrid.height;
    this.height =
      padding * 1.5 + GRID_SIZE * 1.5 + (!popupGrid.hidden ? bodyHeight : 0);

    let rect = getWorldRect(building);
    let sx = building.col ? (building.col + building.gridWidth + 2) * GRID_SIZE : rect.x;
    let sy = building.row
      ? (building.row - 0.5) * GRID_SIZE
      : rect.y + GRID_SIZE / 2;
    this.x =
      sx + this.width < GAME_WIDTH ? sx : sx - 4 * GRID_SIZE - this.width;
    this.y =
      sy + this.height < GAME_HEIGHT
        ? sy
        : sy - this.height / 2;
    // if (this.menuType === TYPES.INFO) {
    //   this.y -= GRID_SIZE * 2.5;
    // } else if (this.menuType === TYPES.TIP) {
    //   this.y -= GRID_SIZE;
    // }

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
    popupGrid.children.forEach(child => child.destroy?.());
    recipeGrid.children.forEach(child => child.destroy?.());
    closeBtn.destroy();
  },

  update() {
    // if (this.menuType === TYPES.RECIPE) {
      // let type = 'inputs';
      // recipeGrid.children?.forEach(child => {
      //   if (child.name && child.name !== 'NONE') {
      //     let recipe = this.for.recipe[type]?.find(([name]) => {
      //       return name === child.name;
      //     });
      //     let has =
      //       type === 'inputs'
      //         ? recipe.has
      //         : this.for.inventory.filter(
      //             ([name]) => ([name]).name === child.name
      //           ).length;

      //     let text = `${has}/${recipe.total}`;
      //     if (child.children[1].text !== text) {
      //       child.children[1].text = text;
      //     }
      //   } else {
      //     type = 'outputs';
      //   }
      // });
    // }
  },

  render() {
    if (this.hidden) return;

    let context = getContext();
    let { x, y, width, height, padding } = this;
    let sx = x - padding;
    let sy = y - padding;
    let swidth = width + padding * 2;
    let sheight = height + padding * 2;

    context.fillStyle = COLORS.white;
    context.fillRect(sx, sy, swidth, GRID_SIZE * 1.35);

    context.fillStyle = COLORS.black;
    context.strokeStyle = COLORS.white;
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

function getRecipe(recipe) {
  // TODO: if there is no recipe selected the popup ui
  // needs some empty slots so the space is still taken up
  if (!recipe) return [];

  recipeName.text = recipe.name;

  let inputs =
    recipe.inputs?.map(([name, amount]) => {
      let btn = new ImageButton({
        name,
        width: GRID_SIZE,
        height: GRID_SIZE,
        text: {
          text: name,
          ...textProps
        }
      });

      if (amount) {
        btn.addChild(
          Text({
            ...textProps,
            font: '12px Arial',
            anchor: { x: 0.5, y: 0 },
            strokeColor: COLORS.black,
            x: GRID_SIZE / 2,
            y: GRID_SIZE * 1.5,
            text: `0/${amount}`,
          })
        );
      }

      return btn;
    }) ?? [];

  let arrow = Text({
    ...textProps,
    font: '18px Arial',
    anchor: { x: 0.5, y: 0.5 },
    width: GRID_SIZE,
    text: '→'
  });
  if (recipe.time) {
    let time = Text({
      ...textProps,
      font: '12px Arial',
      anchor: { x: 0.5, y: 0 },
      strokeColor: COLORS.black,
      y: GRID_SIZE / 2,
      text: recipe.time.toFixed(1) + 's'
    });
    arrow.addChild(time);
  }
  // account for unicode character having lots of spacing
  arrow.width -= 7;

  let outputs =
    recipe.outputs?.map(([ name, amount ]) => {
      let btn = new ImageButton({
        name,
        text: {
          text: name,
          ...textProps
        },
        width: GRID_SIZE,
        height: GRID_SIZE
      });

      if (amount) {
        btn.addChild(
          Text({
            ...textProps,
            font: '12px Arial',
            anchor: { x: 0.5, y: 0 },
            strokeColor: COLORS.black,
            x: GRID_SIZE / 2,
            y: GRID_SIZE * 1.5,
            text: `0/${amount}`
          })
        );
      }

      return btn;
    }) ?? [];
  if (outputs.length) {
    outputs.unshift(arrow);
  }

  return [recipeName, ...inputs, ...outputs];
}