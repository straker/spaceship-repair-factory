import { getPrevPos, getNextPos } from '../utils/index.js';
import grid from '../utils/grid.js';
import { TYPES } from '../constants.js';
import { addBehaviorToBuilding } from './utils.js';

/**
 * Allows a building to take items from the inventory of a building behind it and move it to the inventory of a building in front of it.
 * @param {Building} building - Object the behavior applies to.
 * @param {Object} options - Behavior options.
 * @param {Number} options.amount - Number of items to move.
 * @param {String} options.rate - How often (in seconds) to move an item.
 */
const takeAndMoveItem = {
  buildings: [],
  add(building, options) {
    // a building can only take one item at a time
    if (building.behaviors.takeAndMoveItem) {
      // TODO: warn of second take and move
      return;
    }

    addBehaviorToBuilding('takeAndMoveItem', building, this, {
      dt: 0,
      ...options
    });
  },
  run(dt) {
    this.buildings.forEach(building => {
      _takeAndMoveItemBehavior(building, dt);
    });
  }
};
export default takeAndMoveItem;

// expose for testing
export function _takeAndMoveItemBehavior(building, dt) {
  const { amount, rate } = takeAndMoveItem;
  takeAndMoveItem.dt += dt;

  // can't move an item twice in one update
  if (takeAndMoveItem.dt < rate) {
    return;
  }

  takeAndMoveItem.dt -= rate;
  const { dir } = building;
  const fromBuilding = grid.getByType(
    getPrevPos(building, dir),
    TYPES.building
  )[0];

  // can only take from buildings that have inventory
  if (!fromBuilding || fromBuilding.inventory.length === 0) {
    return;
  }

  // TODO: filtering
  const [item] = fromBuilding.getLastItem();
  const toBuilding = grid.getByType(
    getNextPos(building, dir),
    TYPES.building
  )[0];

  // can only place into buildings that have room for
  // the item
  if (!toBuilding || !toBuilding.canAddItem(item)) {
    return;
  }

  const takenAmount = fromBuilding.removeItem(item, amount);
  toBuilding.addItem(item, takenAmount);

  // TODO: add leftover to self?
  // if (takenAmount - addedAmount !== 0) {
  //   object.addItem(item, takenAmount - addedAmount);
  // }
}
