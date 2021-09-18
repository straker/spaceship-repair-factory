import { MINER_DURATIONS } from '../constants';
import CopperMiner from './copper-miner';

export default class HydrogenMiner extends CopperMiner {
  constructor(properties) {
    super(properties);

    this.name = 'HYDROGEN-EXTRACTOR';
    this.componentName = 'HYDROGEN';
    this.duration = MINER_DURATIONS.HYDROGEN;
  }
}
