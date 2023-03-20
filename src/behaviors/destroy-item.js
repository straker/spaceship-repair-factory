import Behavior from './behavior.js';
import grid from '../utils/grid.js';
import { rotatePosition, getNextPos } from '../utils/index.js';
import { TYPES } from '../constants.js';

class DestroyItemBehavior extends Behavior {
  constructor() {
    super('destroyItem');
  }

  /**
   * Allows a building to destroy an item from its inventory.
   * @param {Building} building - Building the behavior applies to.
   * @param {Object} options - Behavior options.
   * @param {Number} options.amount - Number of items to destroy.
   * @param {Number} options.rate - How often (in seconds) to destroy the item.
   * @param {Object} options.animation - Animation data for when the behavior is activated.
   */
  add(building, options = {}) {
    return super.add(building, {
      ...options
    });
  }

  behavior(building, dt) {
    const destroyItem = building.behaviors.destroyItem[0];
    const { amount, rate, animation } = destroyItem;

    const items = building.getItems();
    if (!items?.length) {
      return;
    }

    let removed = amount;
    for (let i = 0; i < items.length; i++) {
      const [item, count] = items[i];
      if (count <= 0) {
        continue;
      }

      removed -= building.removeItem(item, removed);
      if (removed <= 0) {
        break;
      }
    }

    building.behaviors.shared[0].cooldown = rate;

    if (animation) {
      building.playAnimation('destroyItem');
    }
    return;
  }
}

const destroyItemBehavior = new DestroyItemBehavior();
export default destroyItemBehavior;
