import init from './init.js';
import { GameLoop } from './libs/kontra.js';
import transportManager from './managers/transport-manager.js';
import grid from './utils/grid.js';
import { behaviors } from './behaviors/index.js';

async function main() {
  await init();
  transportManager.canPlace();

  GameLoop({
    update(dt) {
      behaviors.spawnItem.run(dt);
      behaviors.takeAndMoveItem.run(dt);
      grid.update();
    },
    render() {
      grid.render();
    }
  }).start();
}

main();
