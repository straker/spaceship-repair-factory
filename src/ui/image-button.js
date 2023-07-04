import { ButtonClass } from '../libs/kontra.js';
import { GRID_SIZE, COLORS, TEXT_PROPS } from '../constants.js';

export const buttonSize = GRID_SIZE * 1.5;

export default class ImageButton extends ButtonClass {
  constructor(properties) {
    super({
      ...properties,
      width: buttonSize,
      height: buttonSize,
      text: {
        ...TEXT_PROPS,
        x: buttonSize - 4,
        y: buttonSize - 2,
        anchor: { x: 1, y: 1 },
        font: '14px Arial',
        strokeColor: COLORS.black,
        lineWidth: 5,
        ...properties.text
      }
    });

    if (properties.onDown) {
      this.hasDown = true;
    } else {
      this.disable();
    }
  }

  draw() {
    const { name, context, image, width, height } = this;
    const end = buttonSize;

    context.fillStyle = COLORS.black;
    context.fillRect(0, 0, end, end);

    if (image) {
      context.drawImage(
        image,
        buttonSize,
        buttonSize,
        buttonSize,
        buttonSize,
        0,
        0,
        buttonSize,
        buttonSize
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