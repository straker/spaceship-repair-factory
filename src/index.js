import init from './init.js';
import { GameLoop, imageAssets, onInput, Text, Grid } from './libs/kontra.js';
import grid from './utils/grid.js';
import { behaviorOrder, giveBehavior } from './behaviors/index.js';
import {
  GRID_SIZE,
  TYPES,
  COLORS,
  NUM_ROWS,
  NUM_COLS,
  TEXT_PROPS
} from './constants.js';
import Building from './building.js';
import { buildings } from './data/buildings.js';
import { recipes } from './data/items.js';
import { _items } from './item.js';
import ImageButton from './ui/image-button.js';
// import buildingPopup from './ui/building-popup.js';
import { toGrid, getDimensions } from './utils/index.js';
import { showRadius } from './behaviors/generate-power.js';
import Dialog from './ui/dialog.js';
import BuildingDialog from './ui/building-dialog.js';

// window.DEBUG = true

async function main() {
  const { canvas, context, pointer } = await init();

  // const imgBtn = new ImageButton({
  //   x: 100,
  //   y: 100,
  //   width: GRID_SIZE,
  //   height: GRID_SIZE,
  //   image: imageAssets['/src/assets/arm'],
  //   onDown() {}
  // });

  // buildingPopup.init();
  window.cursor = new Building(null, {
    x: 0,
    y: 0,
    width: GRID_SIZE,
    height: GRID_SIZE,
    row: 0,
    col: 0,
    hidden: true,
    allowRotation: true,
    render() {
      const { context, width, height } = this;
      this.draw();

      if (this.id === 'Power I') {
        showRadius(this, 5)
      }

      // directional arrow
      context.save();
      context.translate(this.width / 2, this.height / 2);
      context.rotate(this.facing);
      context.translate(-this.width / 2, -this.height / 2);

      context.fillStyle = COLORS.white;
      context.beginPath();
      context.moveTo(width + 5, height / 2 - 10);
      context.lineTo(width + 15, height / 2);
      context.lineTo(width + 5, height / 2 + 10);
      context.fill();
      context.restore();
    }
  });

  GameLoop({
    // fps: 15,
    update(dt) {
      behaviorOrder.forEach(behavior => behavior.run(dt));
      grid.update();
      _items.forEach(item => item.update());
      window.buildingPopup?.update?.();

      cursor.row = toGrid(pointer.y);
      cursor.col = toGrid(pointer.x);
      cursor.x = cursor.col * GRID_SIZE;
      cursor.y = cursor.row * GRID_SIZE;

      window.testGrid?.update();
    },
    render() {
      grid.render();
      _items.forEach(item => item.render());
      // imgBtn.render();
      window.buildingPopup?.render?.();

      if (window.DEBUG) {
        context.strokeStyle = 'grey';
        context.lineHeight = 2;
        context.beginPath();
        for (let r = 0; r < canvas.height / GRID_SIZE; r++) {
          context.moveTo(0, r * GRID_SIZE);
          context.lineTo(canvas.width, r * GRID_SIZE);
        }
        for (let c = 0; c < canvas.width / GRID_SIZE; c++) {
          context.moveTo(c * GRID_SIZE, 0);
          context.lineTo(c * GRID_SIZE, canvas.height);
        }
        context.stroke();
      }

      if (!cursor.hidden) {
        cursor.render();
      }

      window.buildingPopup?.render?.();
      window.testGrid?.render();
    }
  }).start();

  function setCursor(name) {
    cursor.hidden = false;
    cursor.image = null
    cursor.animations = null;
    cursor.buildingName = name;
    cursor.id = name;

    if (!name) {
      cursor.hidden = true;
      return;
    }

    const building = buildings[name];
    if (building.image) {
      cursor.image = building.image;
      cursor.width = building.image.width;
      cursor.height = building.image.height;
    }

    if (building.animations?.cursor) {
      cursor.animations = building.animations;
      cursor.playAnimation('cursor');
      cursor.width = cursor.currentAnimation.width;
      cursor.height = cursor.currentAnimation.height;
    }

    building.onCursor?.()
  }

  onInput(['1'], () => {
    // don't rotate the belt cursor but instead show the
    // appropriate animation rotation (how?)
    setCursor('Belt I');
  });
  onInput(['2'], () => {
    setCursor('Arm');
  });
  onInput(['3'], () => {
    setCursor('Power I');
  });
  onInput(['4'], () => {
    setCursor('Extractor I');
  });
  onInput(['5'], () => {
    setCursor('Assembler I');
  });
  onInput(['6'], () => {
    setCursor('Storage');
  });
  onInput(['7'], () => {
    setCursor('Furnace I');
  });
  onInput('esc', () => {
    setCursor(null);
  });
  onInput('r', () => {
    cursor.facing = (cursor.facing + Math.PI / 2) % (Math.PI * 2);
  }, { key: { preventDefault: false }});

  onInput('down', () => {

    // select building
    if (!cursor.buildingName) {
      const building = grid.getByType(cursor, TYPES.building)[0];
      if (building?.setRecipe) {
        buildingPopup.show(building);
        return;
      }
    }

    // place building
    const { startRow, startCol, endRow, endCol } = getDimensions(cursor);
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (grid.getByType({ row, col }, TYPES.building)[0]) {
          return;
        }
      }
    }

    new Building(cursor.buildingName, {
      row: cursor.row,
      col: cursor.col,
      rotation: cursor.facing
    });
  });

  window.mainBase = new Building('Main Base', {
    row: NUM_ROWS - 5,
    col: NUM_COLS / 2 - 2
  })
  // window.buildingPopup = new Dialog('Building Popup', {
  //   body: [
  //     Text({ text: 'Hello World Hello World Hello World Hello World', ...TEXT_PROPS }),
  //     Text({ text: 'Hello World', ...TEXT_PROPS })
  //   ]
  // });
  window.buildingPopup = new BuildingDialog(mainBase);

  window.imageButton = new ImageButton({
    // x: 100,
    // y: 100,
    text: {
      font: '14px Arial',
      text: '999'
    }
  });
  window.testGrid = Grid({
    x: 100,
    y: 100,
    children: imageButton
  });

}

main();

window.grid = grid;