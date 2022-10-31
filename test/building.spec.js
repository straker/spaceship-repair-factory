import Building from '../src/building.js';
import { buildings } from '../src/data/buildings.js';
import { items } from '../src/data/items.js';

describe('building', () => {
  let building;
  beforeEach(() => {
    buildings.foo = {
      inventorySlots: 5,
      behaviors: []
    };
    items.foo = {
      stackSize: 100
    };
    building = new Building('foo');
  });

  after(() => {
    delete buildings.foo;
    delete items.foo;
  });

  // TODO: incomplete, need more tests for constructor and destroy

  describe('addItem', () => {
    describe('when stack does not exist', () => {
      it('should create new inventory stack', () => {
        building.addItem('Iron', 5);
        assert.deepEqual(building.inventory, [['Iron', 5]]);
      });

      it('should return the amount added', () => {
        const added = building.addItem('Iron', 5);
        assert.equal(added, 5);
      });

      it('should add multiple stacks', () => {
        const added = building.addItem('foo', 300);
        assert.equal(added, 300);
        assert.deepEqual(building.inventory, [
          ['foo', 100],
          ['foo', 100],
          ['foo', 100]
        ]);
      });

      it('should not create more stacks than building has slots', () => {
        const added = building.addItem('foo', 1000);
        assert.equal(added, 500);
        assert.deepEqual(building.inventory, [
          ['foo', 100],
          ['foo', 100],
          ['foo', 100],
          ['foo', 100],
          ['foo', 100]
        ]);
      });

      it('should add to the first available empty stack', () => {
        building.inventory = [
          ['Iron', 2],
          ['Iron Ore', 3]
        ];
        building.addItem('foo', 5);
        assert.deepEqual(building.inventory, [
          ['Iron', 2],
          ['Iron Ore', 3],
          ['foo', 5]
        ]);
      });

      it('should return 0 if no room for item', () => {
        building.inventory = [
          ['foo', 100],
          ['foo', 100],
          ['foo', 100],
          ['foo', 100],
          ['foo', 100]
        ];
        const added = building.addItem('foo', 5);
        assert.equal(added, 0);
      });
    });

    describe('when stack exists', () => {
      it('should add to the stack', () => {
        building.inventory = [['foo', 5]];
        building.addItem('foo', 5);
        assert.deepEqual(building.inventory, [['foo', 10]]);
      });

      it('should return the amount added', () => {
        building.inventory = [['foo', 5]];
        const added = building.addItem('foo', 5);
        assert.equal(added, 5);
      });

      it('should add to multiple stacks', () => {
        building.inventory = [
          ['foo', 95],
          ['foo', 5]
        ];
        const added = building.addItem('foo', 20);
        assert.equal(added, 20);
        assert.deepEqual(building.inventory, [
          ['foo', 100],
          ['foo', 20]
        ]);
      });

      it('should not create more stacks than building has slots', () => {
        building.inventory = [
          ['foo', 95],
          ['foo', 95],
          ['foo', 100],
          ['foo', 100],
          ['foo', 100]
        ];
        const added = building.addItem('foo', 100);
        assert.equal(added, 10);
        assert.deepEqual(building.inventory, [
          ['foo', 100],
          ['foo', 100],
          ['foo', 100],
          ['foo', 100],
          ['foo', 100]
        ]);
      });

      it('should add to the first available stack', () => {
        building.inventory = [
          ['Iron', 2],
          ['Iron Ore', 3],
          ['foo', 5]
        ];
        building.addItem('foo', 5);
        assert.deepEqual(building.inventory, [
          ['Iron', 2],
          ['Iron Ore', 3],
          ['foo', 10]
        ]);
      });
    });
  });

  describe('removeItem', () => {
    describe('when stack does not exist', () => {
      it('should return 0', () => {
        const removed = building.removeItem('foo', 10);
        assert.equal(removed, 0);
      });
    });

    describe('when stack exists', () => {
      it('should remove from the stack', () => {
        building.inventory = [['foo', 100]];
        building.removeItem('foo', 20);
        assert.deepEqual(building.inventory, [['foo', 80]]);
      });

      it('should return the amount removed', () => {
        building.inventory = [['foo', 100]];
        const removed = building.removeItem('foo', 20);
        assert.equal(removed, 20);
      });

      it('should remove from the last slot', () => {
        building.inventory = [
          ['foo', 100],
          ['foo', 100]
        ];
        const removed = building.removeItem('foo', 20);
        assert.equal(removed, 20);
        assert.deepEqual(building.inventory, [
          ['foo', 100],
          ['foo', 80]
        ]);
      });

      it('should delete stacks that reach 0', () => {
        building.inventory = [['foo', 20]];
        const removed = building.removeItem('foo', 20);
        assert.equal(removed, 20);
        assert.deepEqual(building.inventory, [undefined]);
      });

      it('should remove from multiple stacks', () => {
        building.inventory = [['foo', 95], undefined, ['foo', 5]];
        const removed = building.removeItem('foo', 20);
        assert.equal(removed, 20);
        assert.deepEqual(building.inventory, [
          ['foo', 80],
          undefined,
          undefined
        ]);
      });

      it('should return 0 if nothing was removed', () => {
        building.inventory = [
          ['foo', 100],
          ['foo', 100],
          ['foo', 100],
          ['foo', 100],
          ['foo', 100]
        ];
        const removed = building.removeItem('Iron', 5);
        assert.equal(removed, 0);
      });
    });
  });

  describe('getItems', () => {
    it('should return all items in reverse order', () => {
      building.inventory = [
        ['Iron', 95],
        undefined,
        ['Iron Ore', 5],
        undefined,
        undefined
      ];
      const items = building.getItems();
      assert.deepEqual(items, [
        ['Iron Ore', 5],
        ['Iron', 95]
      ]);
    });
  });

  describe('canAddItem', () => {
    it('should return true if there is an empty slot', () => {
      building.inventory = [
        ['Iron', 95],
        undefined,
        ['Iron Ore', 5],
        undefined,
        undefined
      ];
      assert.isTrue(building.canAddItem('foo'));
    });

    it('should return true if there is room in a slot', () => {
      building.inventory = [
        ['Iron', 95],
        ['Iron', 95],
        ['Iron Ore', 5],
        ['foo', 95],
        ['Iron', 95]
      ];
      assert.isTrue(building.canAddItem('foo'));
    });

    it('should return false if there is no empty slot', () => {
      building.inventory = [
        ['Iron', 95],
        ['Iron', 95],
        ['Iron Ore', 5],
        ['Iron', 95],
        ['Iron', 95]
      ];
      assert.isFalse(building.canAddItem('foo'));
    });

    it('should return false if there is no room in a slot', () => {
      building.inventory = [
        ['Iron', 95],
        ['Iron', 95],
        ['Iron Ore', 5],
        ['foo', 100],
        ['Iron', 95]
      ];
      assert.isFalse(building.canAddItem('foo'));
    });
  });

  describe('getAmountCanAdd', () => {
    it('should return the total number of the item that can be added', () => {
      building.inventory = [
        ['foo', 95],
        ['foo', 90],
        ['foo Ore', 5],
        ['foo', 100],
        undefined
      ];
      const amount = building.getAmountCanAdd('foo');
      assert.equal(amount, 115);
    });
  });
});
