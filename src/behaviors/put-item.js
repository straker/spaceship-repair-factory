import Behavior from './behavior.js';
import grid from '../utils/grid.js';
import { rotatePosition, getNextPos } from '../utils/index.js';
import { TYPES } from '../constants.js';

class PutItemBehavior extends Behavior {
  constructor() {
    super('putItem');
  }

  /**
   * Allows a building to put an item from its inventory into the inventory of the building in front of it.
   * @param {Building} building - Building the behavior applies to.
   * @param {Object} options - Behavior options.
   * @param {Number} options.amount - Number of items to put.
   * @param {Number} options.rate - How often (in seconds) to put the item.
   * @param {Object} options.pos - The row and col position of the exit point on the building to put the item.
   * @param {Object} options.animation - Animation data for when the behavior is activated.
   */
  add(building, options = {}) {
    return super.add(building, {
      ...options
    });
  }

  _behavior(building, dt) {
    const { dir } = building;
    const putItem = building.behaviors.putItem[0];
    const { amount, rate, animation, pos } = putItem;

    const position = rotatePosition(pos, building.facing);
    const toBuilding = grid.getByType(
      getNextPos({
        row: building.row + position.row,
        col: building.col + position.col
      }, dir),
      TYPES.building
    )[0];
    if (!toBuilding) {
      return;
    }

    const items = building.getItems();
    if (!items) {
      return;
    }

    // find first item building has room for
    // TODO: filtering
    for (let i = 0; i < items.length; i++) {
      const [item, count] = items[i];
      if (count <= 0 || !toBuilding.canAddItem(item)) {
        continue;
      }

      const numToTake = Math.min(toBuilding.getAmountCanAdd(item), amount);
      const numTaken = building.removeItem(item, numToTake);
      toBuilding.addItem(item, numTaken);

      // TODO: research can affect move time
      building.behaviors.shared[0].cooldown = rate;

      if (animation) {
        building.playAnimation('putItem');
      }
      return;
    }
  }
}

const putItemBehavior = new PutItemBehavior();
export default putItemBehavior;
