import { ButtonClass } from '../libs/kontra.js';
import { GRID_SIZE, COLORS } from '../constants.js';

export default class ImageButton extends ButtonClass {
  constructor(properties) {
    super(properties);

    if (properties.onDown) {
      this.hasDown = true;
    } else {
      this.disable();
    }
  }

  draw() {
    const { name, context, image, width, height } = this;
    const end = GRID_SIZE;

    context.fillStyle = COLORS.black;
    context.fillRect(0, 0, end, end);

    if (image) {
      context.drawImage(
        image,
        GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE,
        GRID_SIZE,
        0,
        0,
        GRID_SIZE,
        GRID_SIZE
      );
    }
    context.lineWidth = 2;

    if (this.hovered || this.focused || this.selected) {
      context.strokeStyle = COLORS.yellow;
    } else if (!this.hasDown || this.disabled) {
      context.strokeStyle = COLORS.grey;
    } else {
      context.strokeStyle = COLORS.white;
    }

    context.strokeRect(0, 0, end, end);

    if (this.hasDown && this.disabled) {
      context.globalAlpha = 0.6;
      context.fillStyle = COLORS.red;
      context.fillRect(0, 0, end, end);
    }
  }
}