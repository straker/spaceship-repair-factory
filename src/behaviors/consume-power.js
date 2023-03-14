import Behavior from './behavior.js';
import { getState, setState } from '../state.js';

class ConsumePowerBehavior extends Behavior {
  constructor() {
    super('consumePower');
  }

  /**
   * Requires the building to be powered in order to operate. If the building is not powered it will not run any behaviors. Also, building that is not fully powered will operate at a reduced capacity.
   * @param {Building} building - Building the behavior applies to.
   * @param {Object} options - Behavior options.
   * @param {Number} options.amount - The amount of power needed to fully operate the building.
   */
  add(building, options = {}) {
    const { amount } = options;

    building.requiresPower = true;
    building.poweredBy = [];

    setState('powerConsumption', getState('powerConsumption', 0) + amount);

    return super.add(building, {
      ...options
    });
  }

  remove(building, behavior) {
    super.remove(building, behavior);
    setState('powerConsumption', getState('powerConsumption') - behavior.amount);
  }
}

const consumePowerBehavior = new ConsumePowerBehavior();
export default consumePowerBehavior;
