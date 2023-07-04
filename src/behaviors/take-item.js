import Behavior from './behavior.js';
import grid from '../utils/grid.js';
import { getPrevPos, getNextPos } from '../utils/index.js';
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
    return super.add(building, {
      dt: 0,
      ...options
    });
  }

  behavior(building, dt) {
    const { dir } = building;
    const takeItem = building.behaviors.takeItem[0];
    const { amount, rate, cooldown, animation } = takeItem;

    const fromBuilding = grid.getByType(
      getPrevPos(building, dir),
      TYPES.building
    )[0];
    if (!fromBuilding) {
      return;
    }

    const toBuilding = grid.getByType(
      getNextPos(building, dir),
      TYPES.building
    )[0];

    const items = fromBuilding.getItems();
    if (!items) {
      return;
    }

    // find first item building has room for
    // TODO: filtering
    for (let i = 0; i < items.length; i++) {
      const [item, count] = items[i];
      if (items[i].transitioning || count <= 0 || !building.canAddItem(item)) {
        continue;
      }

      // make the behavior smart by not taking items that the
      // building to place into does not accept

      // TODO: bug where the take behavior won't activate until there's a free slot in the building instead of taking the item when it can and just waiting to put it at the next available free slot. do i need another function that's called canAcceptItem to differentiate being able to add at the moment and having the potential to add?
      if (building.behaviors.putItem.length && toBuilding && !toBuilding.canAddItem(item)) {
        continue;
      }

      const numToTake = building.getAmountCanAdd(item, amount);
      const numTaken = fromBuilding.removeItem(item, numToTake);
      building.addItem(item, numTaken);

      // TODO: research can affect move time
      building.behaviors.shared[0].cooldown = rate;

      if (animation) {
        building.playAnimation('takeItem');
      }
      return;
    }
  }
}

const takeItemBehavior = new TakeItemBehavior();
export default takeItemBehavior;
