import { GRID_SIZE, TYPES, MINER_DURATION } from '../constants';
import GameObject from '../utils/game-object';

export default class Miner extends GameObject {
  constructor(properties) {
    properties.width = properties.height = GRID_SIZE * 2;
    properties.type = TYPES.MINER;
    properties.name = 'MINER';
    properties.componentName = 'ASTEROID';
    properties.components = [];
    properties.maxComponents = 5;
    properties.duration = MINER_DURATION;
    properties.timer = 0;

    super(properties);
  }
}
