import Behavior from './behavior.js';
import grid from '../utils/grid.js';
import { getPrevPos } from '../utils/index.js';
import { TYPES } from '../constants.js';

class TakeItemBehavior extends Behavior {
  constructor() {
    super('takeItem');
  }

  /**
   * Allows a building to take an item from the building behind it and place it into its inventory.
   * @param {Building} building - Building the behavior applies to.
   * @param {Object} options - Behavior options.
   * @param {Number} options.amount - Number of items to take.
   * @param {Number} options.rate - How often (in seconds) to take the item.
   */
  add(building, options = {}) {
    super.add(building, {
      dt: 0,
      ...options
    });
  }

  _behavior(building, dt) {
    const { dir } = building;
    const takeItem = building.behaviors.takeItem[0];
    const { amount, rate } = takeItem;

    // TODO: research can affect move time
    takeItem.dt += dt;

    if (takeItem.dt < rate) {
      return;
    }

    const fromBuilding = grid.getByType(
      getPrevPos(building, dir),
      TYPES.building
    )[0];
    if (!fromBuilding) {
      return;
    }

    const items = fromBuilding.getItems();
    if (!items) {
      return;
    }

    // find first item building has room for
    // TODO: filtering
    for (let i = 0; i < items.length; i++) {
      const [item, count] = items[i];
      if (count <= 0 || !building.canAddItem(item)) {
        continue;
      }

      const numToTake = Math.min(building.getAmountCanAdd(item), amount);
      const numTaken = fromBuilding.removeItem(item, numToTake);
      building.addItem(item, numTaken);
      takeItem.dt = 0;
      return;
    }
  }
}

const takeItemBehavior = new TakeItemBehavior();
export default takeItemBehavior;
