import { MINER_DURATIONS } from '../constants';
import CopperMiner from './copper-miner';

export default class IronMiner extends CopperMiner {
  constructor(properties) {
    super(properties);

    this.name = 'IRON-MINER';
    this.componentName = 'IRON';
    this.duration = MINER_DURATIONS.IRON;
  }
}
