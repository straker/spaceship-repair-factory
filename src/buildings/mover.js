import { GRID_SIZE, TYPES } from '../constants';
import GameObject from '../utils/game-object';

export default class Mover extends GameObject {
  constructor(properties) {
    properties.width = properties.height = GRID_SIZE;
    properties.type = TYPES.MOVER;
    properties.name = 'MOVER';
    properties.lastMove = 0;
    properties.menuType = TYPES.FILTER;
    properties.filter = 'NONE';

    super(properties);
  }
}
