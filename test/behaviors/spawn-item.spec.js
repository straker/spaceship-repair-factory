import Building from '../../src/building.js';
import { buildings } from '../../src/data/buildings.js';
import spawnItemBehavior from '../../src/behaviors/spawn-item.js';

describe('behaviors.spawn-item', () => {
  let building;

  beforeEach(() => {
    buildings.foo = {
      inventorySlots: 5,
      behaviors: []
    };
  });

  afterEach(() => {
    if (building) {
      building.destroy();
      building = null;
    }
  });

  after(() => {
    delete buildings.foo;
  });

  describe('add', () => {
    it('should allow more than one behavior', () => {
      building = new Building('foo');
      spawnItemBehavior.add(building, { foo: 1 });
      spawnItemBehavior.add(building, { bar: 2 });
      assert.lengthOf(building.behaviors.spawnItem, 2);
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      building = new Building('foo');
      spawnItemBehavior.add(building, { item: 'Iron', rate: 1, amount: 1 });
    });

    it('should add item to inventory', () => {
      spawnItemBehavior._behavior(building, 1);
      assert.deepEqual(building.inventory, [['Iron', 1]]);
    });

    it('should not add item when timer is below rate', () => {
      spawnItemBehavior._behavior(building, 0.2);
      assert.deepEqual(building.inventory, []);
    });

    it('should add items for each interval above rate', () => {
      spawnItemBehavior._behavior(building, 2);
      assert.deepEqual(building.inventory, [['Iron', 2]]);
    });

    it('should add items for each behavior', () => {
      spawnItemBehavior.add(building, { item: 'Iron Ore', rate: 1, amount: 1 });
      spawnItemBehavior._behavior(building, 1);
      assert.deepEqual(building.inventory, [
        ['Iron', 1],
        ['Iron Ore', 1]
      ]);
    });
  });
});
