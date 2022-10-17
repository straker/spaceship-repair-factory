import './init.js';
import { GameLoop } from './libs/kontra.js';
// import beltManager from './managers/belt-manager.js';
import grid from './utils/grid.js';

async function main() {
  GameLoop({
    update() {
      grid.update();
    },
    render() {
      grid.render();
    }
  }).start();
}

main();
