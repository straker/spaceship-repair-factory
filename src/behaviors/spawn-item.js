import Behavior from './behavior.js';

class SpawnItemBehavior extends Behavior {
  constructor() {
    super('spawnItem');
  }

  /**
   * Allows a building to spawn a item into its inventory.
   * @param {Building} building - Building the behavior applies to.
   * @param {Object} options - Behavior options.
   * @param {String} options.item - Name of the item to spawn.
   * @param {Number} options.amount - Number of items to spawn.
   * @param {Number} options.rate - How often (in seconds) to spawn the item.
   */
  add(building, options = {}) {
    super.add(building, {
      dt: 0,
      allowMultiple: true,
      ...options
    });
  }

  _behavior(building, dt) {
    building.behaviors.spawnItem.forEach(spawnItem => {
      const { item, rate, amount } = spawnItem;
      spawnItem.dt += dt;

      while (spawnItem.dt >= rate) {
        spawnItem.dt -= rate;
        building.addItem(item, amount);
      }
    });
  }
}

const spawnItemBehavior = new SpawnItemBehavior();
export default spawnItemBehavior;
