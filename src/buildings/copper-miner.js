import { GRID_SIZE, TYPES, MINER_DURATIONS } from '../constants';
import GameObject from '../utils/game-object';

export default class CopperMiner extends GameObject {
  constructor(properties) {
    properties.width = properties.height = GRID_SIZE * 2;
    properties.type = TYPES.MINER;
    properties.name = 'COPPER-MINER';
    properties.componentName = 'COPPER';
    properties.components = [];
    properties.maxComponents = 5;
    properties.duration = MINER_DURATIONS.COPPER;
    properties.timer = 0;

    super(properties);
  }
}
