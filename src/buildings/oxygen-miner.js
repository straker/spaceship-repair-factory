import { MINER_DURATIONS } from '../constants';
import CopperMiner from './copper-miner';

export default class OxygenMiner extends CopperMiner {
  constructor(properties) {
    super(properties);

    this.name = 'OXYGEN-EXTRACTOR';
    this.componentName = 'OXYGEN';
    this.duration = MINER_DURATIONS.OXYGEN;
  }
}
