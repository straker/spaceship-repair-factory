import { GRID_SIZE, TYPES } from '../constants';
import GameObject from '../utils/game-object';

export default class Belt extends GameObject {
  constructor(properties) {
    properties.width = properties.height = GRID_SIZE;
    properties.type = TYPES.BELT;
    properties.name = 'BELT';

    super(properties);
  }

  canTakeComponent() {
    return !this.component;
  }

  draw() {
    super.draw();

    // debug purposes
    // let { segment, context, width, height } = this;
    // if (segment?.start === this) {
    //   context.fillStyle = 'rgba(255, 0, 0, 0.5';
    //   context.fillRect(0, 0, width, height);
    // } else if (segment?.end === this) {
    //   context.fillStyle = 'rgba(0, 0, 255, 0.5';
    //   context.fillRect(0, 0, width, height);
    // }
  }
}
