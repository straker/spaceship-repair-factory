import { SpriteClass } from '../libs/kontra.js';
import { DIRS } from '../constants.js';

export default class GameObject extends SpriteClass {
  constructor(properties = {}) {
    if (!properties.anchor) {
      properties.anchor = { x: 0.5, y: 0.5 };
    }

    properties.dir = DIRS[properties.rotation];

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

  canTakeComponent() {
    return false;
  }
}
