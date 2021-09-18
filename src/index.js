import {
  init,
  initKeys,
  initPointer,
  GameLoop,
  emit,
  on,
  // loadImage,
  imageAssets
} from './libs/kontra';
import {
  NUM_ROWS,
  NUM_COLS,
  GAME_WIDTH,
  GAME_HEIGHT,
  GRID_SIZE,
  TYPES,
  DIRS,
  TICK_DURATION,
  COLORS
} from './constants';
import grid from './utils/grid';

import componentManager from './managers/component-manager';
import beltManager from './managers/belt-manager';
import minerManager from './managers/miner-manager';
import moverManager from './managers/mover-manager';
import repairerManager from './managers/repairer-manager';
import assemblerManager from './managers/assembler-manager';
import cursorManager from './managers/cursor-manager';
import shipManager from './managers/ship-manager';
import cursor from './ui/cursor';
import buildingPopup from './ui/building-popup';
import { layers } from './assets/tilemap.json';

import componentDisplay from './ui/component-display';
import buildingMenubar from './ui/building-menubar';

let { canvas, context } = init();

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

initKeys();
initPointer();
let wallInfo = {
  33: { dir: DIRS.RIGHT },
  42: { dir: DIRS.DOWN },
  31: { dir: DIRS.LEFT },
  22: { dir: DIRS.UP },
  29: { dir: DIRS.RIGHT, type: null },
  30: { dir: DIRS.DOWN, type: null },
  39: { dir: DIRS.LEFT, type: null },
  40: { dir: DIRS.UP, type: null }
};

let img = new Image();
imageAssets.tilesheet = img;
img.src = 'data:image/webp;base64,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';
img.onload = () => {
// loadImage('tilesheet.webp').then(() => {
  let tilesheetCols = imageAssets.tilesheet.width / GRID_SIZE;

  let tileCanvas = document.createElement('canvas');
  let tileContext = tileCanvas.getContext('2d');
  tileCanvas.width = GAME_WIDTH;
  tileCanvas.height = GAME_HEIGHT;
  tileContext.fillStyle = COLORS.PURPLE;

  let starsCanvas = document.createElement('canvas');
  let starsContext = starsCanvas.getContext('2d');
  starsCanvas.width = GRID_SIZE * 4;
  starsCanvas.height = GRID_SIZE * 2;
  let starIndex = 0;

  // fill the grid with walls
  for (let row = 0; row < NUM_ROWS; row++) {
    for (let col = 0; col < NUM_COLS; col++) {
      let tile = layers[0].data[row * NUM_COLS + col];

      // don't draw the stars on the tilesheet
      if (![27, 28, 37, 38].includes(tile)) {
        // start with a filled background
        tileContext.fillRect(
          col * GRID_SIZE,
          row * GRID_SIZE,
          GRID_SIZE,
          GRID_SIZE
        );

        if (tile) {
          tileContext.drawImage(
            imageAssets.tilesheet,
            // Tiled indices add 1 to the tilesheet
            ((tile - 1) % tilesheetCols) * GRID_SIZE,
            (((tile - 1) / tilesheetCols) | 0) * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE,
            col * GRID_SIZE,
            row * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
          );
        }
      } else {
        starsContext.drawImage(
          imageAssets.tilesheet,
          // Tiled indices add 1 to the tilesheet
          ((tile - 1) % tilesheetCols) * GRID_SIZE,
          (((tile - 1) / tilesheetCols) | 0) * GRID_SIZE,
          GRID_SIZE,
          GRID_SIZE,
          (starIndex % 4) * GRID_SIZE,
          ((starIndex / 4) | 0) * GRID_SIZE,
          GRID_SIZE,
          GRID_SIZE
        );
        starIndex++;
      }

      // 11 = minable floor
      if (tile && tile !== 11) {
        grid.add({
          type: TYPES.WALL,
          ...wallInfo[tile],
          tile,
          row,
          col,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      }
    }
  }

  // order here is important and determines the order in which
  // these managers run (so a mover will move a component off a
  // belt before it moves along the belt)
  // general order:
  // 1. production
  // 2. mover
  // 3. belts
  shipManager.init();
  minerManager.init();
  assemblerManager.init();
  moverManager.init();
  repairerManager.init();
  componentManager.init();
  beltManager.init();

  // uis
  buildingPopup.init();
  cursorManager.init();
  componentDisplay.init();
  buildingMenubar.init();

  let counter = 0;
  let loop = GameLoop({
    blur: true,
    update(dt) {
      emit('update');
      grid.update();

      cursor.update();
      buildingPopup.update();
      buildingMenubar.update();
      cursorManager.update();

      // update all game logic every 200 ms (200ms / 1000 ms = 0.2)
      counter += dt;
      if (counter >= TICK_DURATION) {
        counter -= TICK_DURATION;
        emit('preGameTick');
        emit('gameTick');
      }
    },
    render() {
      context.drawImage(
        starsCanvas,
        GRID_SIZE * 6,
        GRID_SIZE * 25,
        GRID_SIZE * 4,
        GRID_SIZE * 2
      );
      shipManager.render();
      context.drawImage(tileCanvas, 0, 0, GAME_WIDTH, GAME_HEIGHT);

      grid.render();
      componentManager.render();

      componentDisplay.render();
      buildingMenubar.render();
      cursorManager.render();
    }
  });
  loop.start();

  on('over', () => {
    loop.stop();
  });
}
