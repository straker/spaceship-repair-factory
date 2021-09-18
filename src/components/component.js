import { TYPES } from '../constants';
import GameObject from '../utils/game-object';

export default class Component extends GameObject {
  constructor(properties) {
    properties.type = TYPES.COMPONENT;

    super(properties);
  }
}
