import { GRID_SIZE, TYPES } from '../constants.js';
import { i18n } from '../data/translations.js';
import GameObject from '../utils/game-object.js';
import { recipies } from '../data/components';

export default class Assembler extends GameObject {
  constructor(properties) {
    properties.width = properties.height = GRID_SIZE;
    properties.type = TYPES.assembler;
    properties.name = i18n('Assembler');
    properties.recipie = recipies.none;
    properties.components = [];
    properties.maxComponents = super(properties);
  }

  canTakeComponent() {
    return !this.component;
  }

  draw() {}
}
