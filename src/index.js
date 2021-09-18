import {
  init,
  initKeys,
  initPointer,
  GameLoop,
  emit,
  // on,
  loadImage,
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

loadImage('tilesheet.webp').then(() => {
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

  // on('over', () => {
  //   loop.stop();
  // });
});
