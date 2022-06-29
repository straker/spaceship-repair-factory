import { on } from '../libs/kontra';
import Miner from '../buildings/miner';
import { layers } from '../assets/tilemap.json';
import { NUM_COLS } from '../constants';
import { removeFromArray } from '../utils';

let miners = [];
let minerManager = {
  init() {
    let timer = 0;
    let name = '';

    on('gameTick', () => {
      // update animation every 3 game ticks
      if (++timer === 3) {
        timer = 0;
        name = name === '' ? '_END' : '';
      }

      miners.forEach(miner => {
        miner.name = 'MINER' + name;

        let { components, maxComponents } = miner;
        miner.timer = ++miner.timer % miner.duration;
        if (miner.timer === 0 && components.length < maxComponents) {
          miner.timer = 0;
          components.push({
            name: miner.componentName
          });
        }
      });
    });
  },

  add(properties) {
    let miner = new Miner(properties);
    miners.push(miner);
    return miner;
  },

  remove(miner) {
    removeFromArray(miners, miner);
  },

  // miner can only be placed on empty spots
  canPlace(cursor, items) {
    let tile = layers[0].data[cursor.row * NUM_COLS + cursor.col];
    return !items.length && tile === 11;
  }
};

export default minerManager;
