import Behavior from './behavior.js';
import grid from '../utils/grid.js';
import { TYPES } from '../constants.js';
import { on } from '../libs/kontra.js';

class GeneratePowerBehavior extends Behavior {
  constructor() {
    super('generatePower');
  }

  /**
   * Allows a building to generate power.
   * @param {Building} building - Building the behavior applies to.
   * @param {Object} options - Behavior options.
   * @param {Number} options.amount - The amount of power generated.
   */
  add(building, options = {}) {
    /*
      how do i want this to work?
      - checking if a building is within a power building range should only happen when a building has been placed or deleted (no need to check it every frame).
      - checking if there is enough power to power all buildings should also happen when a building has been placed or deleted
      - will need a total amount of power generated and total amount of power draw
    */

    on('updatePower', () => {

    });

    return super.add(building, {
      ...options
    });
  }

  _behavior(building, dt) {
    const generatePower = building.behaviors.generatePower[0];
    const { input } = generatePower;


  }
}

const generatePowerBehavior = new GeneratePowerBehavior();
export default GeneratePowerBehavior;
