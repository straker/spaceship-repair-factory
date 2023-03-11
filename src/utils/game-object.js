import { SpriteClass } from '../libs/kontra.js';
import { DIRS, GRID_SIZE } from '../constants.js';
import { toGrid } from './index.js';

export default class GameObject extends SpriteClass {
  constructor(properties = {}) {
    if (!properties.anchor) {
      properties.anchor = { x: 0.5, y: 0.5 };
    }

    // down is the default direction
    properties.dir = DIRS[properties.facing ?? Math.PI / 2];

    if (properties.x !== undefined) {
      properties.row = toGrid(properties.y);
      properties.col = toGrid(properties.x);
    } else if (properties.row !== undefined) {
      properties.x = properties.col * GRID_SIZE;
      properties.y = properties.row * GRID_SIZE;
    }

    super(properties);

    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    this.center = {
      x: this.x + this.halfWidth,
      y: this.y + this.halfHeight,
    };
    this.center.row = toGrid(this.center.y);
    this.center.col = toGrid(this.center.x);

  }
}
