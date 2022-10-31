import Building from '../../src/building.js';
import { buildings } from '../../src/data/buildings.js';
import { items } from '../../src/data/items.js';
import takeItemBehavior from '../../src/behaviors/take-item.js';
import grid from '../../src/utils/grid.js';
import { GRID_SIZE } from '../../src/constants.js';

describe('behaviors.take-item', () => {
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
      takeItemBehavior.add(building, { foo: 1 });
      takeItemBehavior.add(building, { bar: 2 });
      assert.lengthOf(building.behaviors.takeItem, 1);
      assert.equal(building.behaviors.takeItem[0].bar, 2);
    });
  });

  describe('behavior', () => {
    let fromBuilding;

    beforeEach(() => {
      building = new Building('foo', {
        row: 5,
        col: 5,
        width: GRID_SIZE,
        height: GRID_SIZE
      });
      fromBuilding = new Building('foo', {
        row: 5,
        col: 4,
        width: GRID_SIZE,
        height: GRID_SIZE
      });

      takeItemBehavior.add(building, { rate: 1, amount: 1 });
    });

    afterEach(() => {
      fromBuilding.destroy();
    });

    it('should take item from previous building', () => {
      fromBuilding.inventory = [['Iron', 5]];
      takeItemBehavior._behavior(building, 1);
      assert.deepEqual(building.inventory, [['Iron', 1]]);
    });

    it('should remove the item from the previous building', () => {
      fromBuilding.inventory = [['Iron', 5]];
      building.inventory = [['Iron', 5]];
      takeItemBehavior._behavior(building, 1);
      assert.deepEqual(fromBuilding.inventory, [['Iron', 4]]);
    });

    it('should take first item building can add', () => {
      fromBuilding.inventory = [
        ['Iron Ore', 5],
        ['Iron', 5]
      ];
      building.inventorySlots = 1;
      building.inventory = [['Iron', 5]];
      takeItemBehavior._behavior(building, 1);
      assert.deepEqual(building.inventory, [['Iron', 6]]);
    });

    it('should not take item when timer is below rate', () => {
      fromBuilding.inventory = [['Iron', 5]];
      takeItemBehavior._behavior(building, 0.2);
      assert.deepEqual(building.inventory, []);
    });

    it('should not take if there is no building', () => {
      grid.remove(fromBuilding);
      fromBuilding.inventory = [['Iron', 5]];
      takeItemBehavior._behavior(building, 1);
      assert.deepEqual(building.inventory, []);
    });

    it('should not take if previous building does not have inventory', () => {
      takeItemBehavior._behavior(building, 1);
      assert.deepEqual(building.inventory, []);
    });

    it('should not take items that have 0 count', () => {
      fromBuilding.inventory = [
        ['Iron', 0],
        ['Iron Ore', 5]
      ];
      building.inventory = [['Iron', 5]];
      takeItemBehavior._behavior(building, 1);
      assert.deepEqual(building.inventory, [
        ['Iron', 5],
        ['Iron Ore', 1]
      ]);
    });

    it('should only take as many as previous building has', () => {
      fromBuilding.inventory = [['Iron', 5]];
      takeItemBehavior.add(building, { rate: 1, amount: 10 });
      building.inventory = [['Iron', 5]];
      takeItemBehavior._behavior(building, 1);
      assert.deepEqual(building.inventory, [['Iron', 10]]);
    });

    it('should only take as many as building can have', () => {
      fromBuilding.inventory = [['foo', 5]];
      takeItemBehavior.add(building, { rate: 1, amount: 10 });
      building.inventorySlots = 1;
      building.inventory = [['foo', 7]];
      takeItemBehavior._behavior(building, 1);
      assert.deepEqual(fromBuilding.inventory, [['foo', 2]]);
      assert.deepEqual(building.inventory, [['foo', 10]]);
    });
  });
});
