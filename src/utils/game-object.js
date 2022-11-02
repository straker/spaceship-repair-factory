import { SpriteClass } from '../libs/kontra.js';
import { DIRS, GRID_SIZE } from '../constants.js';

export default class GameObject extends SpriteClass {
  constructor(properties = {}) {
    // if (!properties.anchor) {
    //   properties.anchor = { x: 0.5, y: 0.5 };
    // }

    properties.dir = DIRS[properties.rotation ?? 0];

    if (properties.x !== undefined) {
      properties.row = (properties.y / GRID_SIZE) | 0;
      properties.col = (properties.x / GRID_SIZE) | 0;
    } else if (properties.row !== undefined) {
      properties.x = properties.col * GRID_SIZE;
      properties.y = properties.row * GRID_SIZE;
    }

    super(properties);
  }

  get rotation() {
    return this._rot;
  }

  set rotation(value) {
    this._rot = value;
    this.dir = DIRS[value];
    this._pc();
  }
}
