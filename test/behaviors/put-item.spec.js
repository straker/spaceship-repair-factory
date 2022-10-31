import Building from '../../src/building.js';
import { buildings } from '../../src/data/buildings.js';
import { items } from '../../src/data/items.js';
import putItemBehavior from '../../src/behaviors/put-item.js';
import grid from '../../src/utils/grid.js';
import { GRID_SIZE } from '../../src/constants.js';

describe('behaviors.put-item', () => {
  let building;

  beforeEach(() => {
    buildings.foo = {
      inventorySlots: 5,
      behaviors: []
    };
    items.foo = {
      stackSize: 10
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
    delete items.foo;
  });

  describe('add', () => {
    it('should only allow one', () => {
      building = new Building('foo');
      putItemBehavior.add(building, { foo: 1 });
      putItemBehavior.add(building, { bar: 2 });
      assert.lengthOf(building.behaviors.putItem, 1);
      assert.equal(building.behaviors.putItem[0].bar, 2);
    });
  });

  describe('behavior', () => {
    let toBuilding;

    beforeEach(() => {
      building = new Building('foo', {
        row: 5,
        col: 5,
        width: GRID_SIZE,
        height: GRID_SIZE
      });
      toBuilding = new Building('foo', {
        row: 5,
        col: 6,
        width: GRID_SIZE,
        height: GRID_SIZE
      });

      putItemBehavior.add(building, { rate: 1, amount: 1 });
    });

    afterEach(() => {
      toBuilding.destroy();
    });

    it('should put item to next building', () => {
      building.inventory = [['Iron', 5]];
      putItemBehavior._behavior(building, 1);
      assert.deepEqual(toBuilding.inventory, [['Iron', 1]]);
    });

    it('should remove the item from the building', () => {
      building.inventory = [['Iron', 5]];
      toBuilding.inventory = [['Iron', 5]];
      putItemBehavior._behavior(building, 1);
      assert.deepEqual(building.inventory, [['Iron', 4]]);
    });

    it('should put first item next building can add', () => {
      building.inventory = [
        ['Iron Ore', 5],
        ['Iron', 5]
      ];
      toBuilding.inventorySlots = 1;
      toBuilding.inventory = [['Iron', 5]];
      putItemBehavior._behavior(building, 1);
      assert.deepEqual(toBuilding.inventory, [['Iron', 6]]);
    });

    it('should not put item when timer is below rate', () => {
      building.inventory = [['Iron', 5]];
      putItemBehavior._behavior(building, 0.2);
      assert.deepEqual(toBuilding.inventory, []);
    });

    it('should not put if there is no building', () => {
      grid.remove(toBuilding);
      building.inventory = [['Iron', 5]];
      putItemBehavior._behavior(building, 1);
      assert.deepEqual(toBuilding.inventory, []);
    });

    it('should not put if building does not have inventory', () => {
      putItemBehavior._behavior(building, 1);
      assert.deepEqual(toBuilding.inventory, []);
    });

    it('should not put items that have 0 count', () => {
      building.inventory = [
        ['Iron', 0],
        ['Iron Ore', 5]
      ];
      toBuilding.inventory = [['Iron', 5]];
      putItemBehavior._behavior(building, 1);
      assert.deepEqual(toBuilding.inventory, [
        ['Iron', 5],
        ['Iron Ore', 1]
      ]);
    });

    it('should only put as many as building can take', () => {
      building.inventory = [['Iron', 5]];
      putItemBehavior.add(building, { rate: 1, amount: 10 });
      toBuilding.inventory = [['Iron', 5]];
      putItemBehavior._behavior(building, 1);
      assert.deepEqual(toBuilding.inventory, [['Iron', 10]]);
    });

    it('should only remove as many as next building can have', () => {
      building.inventory = [['foo', 5]];
      putItemBehavior.add(building, { rate: 1, amount: 10 });
      toBuilding.inventorySlots = 1;
      toBuilding.inventory = [['foo', 7]];
      putItemBehavior._behavior(building, 1);
      assert.deepEqual(building.inventory, [['foo', 2]]);
      assert.deepEqual(toBuilding.inventory, [['foo', 10]]);
    });
  });
});
