import { TYPES } from '../constants';
import Mover from './mover';

export default class Repairer extends Mover {
  constructor(properties) {
    super(properties);

    this.type = TYPES.MOVER;
    this.name = 'REPAIRER';
  }
}
