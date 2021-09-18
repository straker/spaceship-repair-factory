import { on } from '../libs/kontra';
import CopperMiner from '../buildings/copper-miner';
import IronMiner from '../buildings/iron-miner';
import TitaniumMiner from '../buildings/titanium-miner';
import HydrogenMiner from '../buildings/hydrogen-miner';
import OxygenMiner from '../buildings/oxygen-miner';
import { layers } from '../assets/tilemap.json';
import { NUM_COLS } from '../constants';
import { removeFromArray } from '../utils';

let miners = [];
let Constructors = {
  'COPPER-MINER': CopperMiner,
  'IRON-MINER': IronMiner,
  'TITANIUM-MINER': TitaniumMiner,
  'HYDROGEN-EXTRACTOR': HydrogenMiner,
  'OXYGEN-EXTRACTOR': OxygenMiner
};

let minerManager = {
  init() {
    on('gameTick', () => {
      miners.forEach(miner => {
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
    let miner = new Constructors[properties.name](properties);
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
