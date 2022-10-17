import { GRID_SIZE, TYPES } from '../constants.js';
import { i18n } from '../data/translations.js';
import GameObject from '../utils/game-object.js';

export default class Belt extends GameObject {
  constructor(properties) {
    properties.width = properties.height = GRID_SIZE;
    properties.type = TYPES.belt;
    properties.name = i18n('Belt');

    super(properties);
  }

  canTakeComponent() {
    return !this.component;
  }

  draw() {
    const { context, width, height } = this;
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, 2);
    context.fillRect(0, height - 2, width, 2);
    context.beginPath();

    const triWidth = 15;
    const triHeight = 13;

    context.moveTo(width / 2 - triHeight / 2, height / 2 - triWidth / 2);
    context.lineTo(width / 2 + triHeight / 2, height / 2);
    context.lineTo(width / 2 - triHeight / 2, height / 2 + triWidth / 2);
    context.fill();
  }
}
