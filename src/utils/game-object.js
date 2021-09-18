import { Sprite, imageAssets } from '../libs/kontra';
import { GRID_SIZE, DIRS } from '../constants';
import tileatlas from '../assets/tileatlas.json';

export default class GameObject extends Sprite.class {
  constructor(properties = {}) {
    if (!properties.anchor) {
      properties.anchor = { x: 0.5, y: 0.5 };
    }

    let atlas = tileatlas[properties.name];
    if (atlas) {
      let [ a, b, atlasWidth, atlasHeight ] = atlas;
      properties.width = atlasWidth * GRID_SIZE;
      properties.height = atlasHeight * GRID_SIZE;

      if (!properties.x) {
        properties.x = (properties.col + (1 - 0.5 * atlasWidth)) * GRID_SIZE;
        properties.y = (properties.row + (1 - 0.5 * atlasHeight)) * GRID_SIZE;
      }
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

  draw() {
    let { name, context, width, height } = this;
    let atlas = tileatlas[name];
    if (atlas) {
      let [ atlasRow, atlasCol ] = atlas;
      context.drawImage(
        imageAssets.tilesheet,
        atlasCol * GRID_SIZE,
        atlasRow * GRID_SIZE,
        width,
        height,
        0,
        0,
        width,
        height
      );
    }
  }
}
