import { addBehaviorToBuilding } from './utils.js';

/**
 * Allows a building to spawn a item on a set interval.
 * @param {Building} building - Building the behavior applies to.
 * @param {Object} options - Behavior options.
 * @param {String} options.item - Name of the item to spawn.
 * @param {Number} options.amount - Number of items to spawn.
 * @param {Number} options.rate - How often (in seconds) to spawn the item.
 */
const spawnItem = {
  buildings: [],
  add(building, options) {
    addBehaviorToBuilding('spawnItem', building, this, {
      dt: 0,
      ...options
    });
  },
  run(dt) {
    this.buildings.forEach(building => {
      building.behaviors.spawnItem.forEach(spawnItem => {
        const { item, rate, amount } = spawnItem;
        spawnItem.dt += dt;

        while (spawnItem.dt >= rate) {
          spawnItem.dt -= rate;
          building.addItem(item, amount);
        }
      });
    });
  }
};
export default spawnItem;
