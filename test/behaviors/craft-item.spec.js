import Building from '../../src/building.js';
import { buildings } from '../../src/data/buildings.js';
import { items } from '../../src/data/items.js';
import { MAX_CRAFT_STORAGE } from '../../src/constants.js';

describe('craft-item', () => {
  let building;
  let max;
  beforeEach(() => {
    buildings.foo = {
      inventorySlots: 5,
      behaviors: [['craftItem', {}]]
    };
    items.foo = {
      stackSize: 100
    };
    items.fooOre = {
      stackSize: 100
    };
    items.fooBar = {
      stackSize: 100
    };
    items.fooSlag = {
      stackSize: 100
    };
    building = new Building('foo');
    building.setRecipe({
      inputs: [
        ['foo', 5],
        ['fooOre', 1]
      ],
      outputs: [
        ['fooBar', 1],
        ['fooSlag', 5]
      ],
      time: 0.5
    });
    max = building.recipe.inputs[0][1] * MAX_CRAFT_STORAGE;
  });

  after(() => {
    delete buildings.foo;
    delete items.foo;
    delete items.fooOre;
    delete items.fooBar;
    delete items.fooSlag;
  });

  function resetRecipe() {
    building.recipe = null;
    building.inputs = [];
    building.outputs = [];
  }

  describe('setRecipe', () => {
    const recipe = {
      inputs: [
        ['foo', 5],
        ['fooOre', 1]
      ],
      outputs: [
        ['fooBar', 1],
        ['fooSlag', 5]
      ],
      time: 0.5
    };

    it('should set recipe', () => {
      building.setRecipe(recipe);
      assert.equal(building.recipe, recipe);
    });

    it('should set inputs', () => {
      building.setRecipe(recipe);
      assert.deepEqual(building.inputs, [
        ['foo', 0],
        ['fooOre', 0]
      ]);
    });

    it('should set outputs', () => {
      building.setRecipe(recipe);
      assert.deepEqual(building.outputs, [
        ['fooBar', 0],
        ['fooSlag', 0]
      ]);
    });

    it('should reset prior recipe', () => {
      building.setRecipe(recipe);
      building.setRecipe({
        inputs: [['Iron Ore', 1]],
        outputs: [['Iron', 1]],
        time: 0.5
      });
      assert.deepEqual(building.inputs, [['Iron Ore', 0]]);
      assert.deepEqual(building.outputs, [['Iron', 0]]);
    });
  });

  describe('addItem', () => {
    it('should add to correct input', () => {
      building.addItem('foo', 5);
      assert.deepEqual(building.inputs, [
        ['foo', 5],
        ['fooOre', 0]
      ]);
    });

    it('should return the amount added', () => {
      const added = building.addItem('foo', 5);
      assert.equal(added, 5);
    });

    it('should cap inputs to recipe amount', () => {
      const added = building.addItem('foo', 100);
      assert.equal(added, max);
      assert.deepEqual(building.inputs, [
        ['foo', max],
        ['fooOre', 0]
      ]);
    });

    it('should not add to inventory', () => {
      building.addItem('foo', 100);
      assert.deepEqual(building.inventory, []);
    });

    it('should return 0 if nothing was added', () => {
      building.inputs[0] = ['foo', max];
      const added = building.addItem('foo', 100);
      assert.equal(added, 0);
    });

    it('should return 0 if not a recipe item', () => {
      const added = building.addItem('Iron', 100);
      assert.equal(added, 0);
    });

    it('should return 0 if no recipe is set', () => {
      resetRecipe();
      const added = building.addItem('Iron', 100);
      assert.equal(added, 0);
    });

    describe('inputsToInventory', () => {
      beforeEach(() => {
        building.inputsToInventory = true;
      });

      it('should add non-recipe item to inventory', () => {
        const added = building.addItem('Iron', 5);
        assert.equal(added, 5);
        assert.deepEqual(building.inventory, [['Iron', 5]]);
      });

      it('should overflow recipe item to inventory', () => {
        const added = building.addItem('foo', 50);
        assert.equal(added, 50);
        assert.deepEqual(building.inventory, [['foo', 50 - max]]);
      });
    });
  });

  describe('removeItem', () => {
    it('should remove from the correct output', () => {
      building.outputs[0][1] = 100;
      building.removeItem('fooBar', 20);
      assert.deepEqual(building.outputs, [
        ['fooBar', 80],
        ['fooSlag', 0]
      ]);
    });

    it('should return the amount removed', () => {
      building.outputs[0][1] = 100;
      const removed = building.removeItem('fooBar', 20);
      assert.equal(removed, 20);
    });

    it('should remove from outputs before inventory', () => {
      building.outputs[0][1] = 10;
      building.inventory = [['fooBar', 10]];
      const removed = building.removeItem('fooBar', 10);
      assert.equal(removed, 10);
      assert.deepEqual(building.inventory, [['fooBar', 10]]);
    });

    it('should remove from inventory if outputs are gone', () => {
      building.outputs[0][1] = 10;
      building.inventory = [['fooBar', 10]];
      const removed = building.removeItem('fooBar', 20);
      assert.equal(removed, 20);
      assert.deepEqual(building.inventory, [undefined]);
    });

    it('should not delete outputs that reach 0', () => {
      building.outputs[0][1] = 20;
      const removed = building.removeItem('fooBar', 20);
      assert.equal(removed, 20);
      assert.deepEqual(building.outputs, [
        ['fooBar', 0],
        ['fooSlag', 0]
      ]);
    });

    it('should return 0 if nothing was removed', () => {
      building.outputs[0][1] = 0;
      const removed = building.removeItem('fooBar', 100);
      assert.equal(removed, 0);
    });

    it('should return 0 if no recipe is set', () => {
      resetRecipe();
      const removed = building.removeItem('Iron', 100);
      assert.equal(removed, 0);
    });
  });

  describe('canAddItem', () => {
    it('should return true if there is room in inputs', () => {
      building.inputs[0][1] = 0;
      assert.isTrue(building.canAddItem('foo'));
    });

    it('should return false if there is no room in inputs', () => {
      building.inputs[0][1] = max;
      assert.isFalse(building.canAddItem('foo'));
    });

    it('should return false if inventory has room', () => {
      building.inputs[0][1] = max;
      building.inventory = [['foo', 5]];
      assert.isFalse(building.canAddItem('foo'));
    });

    it('should return false if no recipe is set', () => {
      resetRecipe();
      assert.isFalse(building.canAddItem('foo'));
    });

    describe('inputsToInventory', () => {
      beforeEach(() => {
        building.inputsToInventory = true;
      });

      it('should return true if inventory has room', () => {
        building.inputs[0][1] = max;
        building.inventory = [['foo', 5]];
        assert.isTrue(building.canAddItem('foo'));
      });

      it('should return false if inventory is full', () => {
        building.inputs[0][1] = max;
        building.inventory = [
          ['Iron', 5],
          ['Iron', 5],
          ['Iron', 5],
          ['Iron', 5],
          ['Iron', 5]
        ];
        assert.isFalse(building.canAddItem('foo'));
      });
    });
  });

  describe('hasRequiredInputs', () => {
    it('should return true if has required inputs', () => {
      building.inputs = [
        ['foo', 5],
        ['fooOre', 1]
      ];
      assert.isTrue(building.hasRequiredInputs());
    });

    it('should return false if does not have required inputs', () => {
      building.inputs = [
        ['foo', 4],
        ['fooOre', 1]
      ];
      assert.isFalse(building.hasRequiredInputs());
    });

    it('should return false if no recipe set', () => {
      resetRecipe();
      assert.isFalse(building.hasRequiredInputs());
    });

    describe('craftFromInventory', () => {
      beforeEach(() => {
        building.craftFromInventory = true;
      });

      it('should return true if inventory has required inputs', () => {
        building.inventory = [undefined, ['foo', 5], undefined, ['fooOre', 1]];
        assert.isTrue(building.hasRequiredInputs());
      });

      it('should return false if inventory does not have required inputs', () => {
        building.inventory = [undefined, ['foo', 4], undefined, ['fooOre', 1]];
        assert.isFalse(building.hasRequiredInputs());
      });

      it('should return true if inputs and inventory has required inputs', () => {
        building.inputs = [
          ['foo', 1],
          ['fooOre', 0]
        ];
        building.inventory = [undefined, ['foo', 4], undefined, ['fooOre', 1]];
        assert.isTrue(building.hasRequiredInputs());
      });
    });
  });

  describe('craftItem', () => {
    it('should take from inputs', () => {
      building.inputs = [
        ['foo', 5],
        ['fooOre', 1]
      ];
      building.craftItem();
      assert.deepEqual(building.inputs, [
        ['foo', 0],
        ['fooOre', 0]
      ]);
    });

    it('should add to outputs', () => {
      building.inputs = [
        ['foo', 5],
        ['fooOre', 1]
      ];
      building.craftItem();
      assert.deepEqual(building.outputs, [
        ['fooBar', 1],
        ['fooSlag', 5]
      ]);
    });

    it('should cap outputs to recipe amount', () => {
      building.inputs = [
        ['foo', 5],
        ['fooOre', 1]
      ];
      building.outputs = [
        ['fooBar', MAX_CRAFT_STORAGE],
        ['fooSlag', 5 * MAX_CRAFT_STORAGE]
      ];
      building.craftItem();
      assert.deepEqual(building.outputs, [
        ['fooBar', MAX_CRAFT_STORAGE],
        ['fooSlag', 5 * MAX_CRAFT_STORAGE]
      ]);
    });

    it('should not add to inventory', () => {
      building.inputs = [
        ['foo', 5],
        ['fooOre', 1]
      ];
      building.outputs = [
        ['fooBar', MAX_CRAFT_STORAGE],
        ['fooSlag', 5 * MAX_CRAFT_STORAGE]
      ];
      building.craftItem();
      assert.deepEqual(building.inventory, []);
    });

    describe('craftFromInventory', () => {
      beforeEach(() => {
        building.craftFromInventory = true;
      });

      it('should take items from inventory', () => {
        building.inventory = [
          ['foo', 20],
          ['fooOre', 20]
        ];
        building.craftItem();
        assert.deepEqual(building.inventory, [
          ['foo', 15],
          ['fooOre', 19]
        ]);
        assert.deepEqual(building.outputs, [
          ['fooBar', 1],
          ['fooSlag', 5]
        ]);
      });

      it('should take items from inputs first', () => {
        building.inputs = [
          ['foo', 3],
          ['fooOre', 1]
        ];
        building.inventory = [
          ['foo', 20],
          ['fooOre', 20]
        ];
        building.craftItem();
        assert.deepEqual(building.inputs, [
          ['foo', 0],
          ['fooOre', 0]
        ]);
        assert.deepEqual(building.inventory, [
          ['foo', 18],
          ['fooOre', 20]
        ]);
        assert.deepEqual(building.outputs, [
          ['fooBar', 1],
          ['fooSlag', 5]
        ]);
      });
    });

    describe('outputsToInventory', () => {
      beforeEach(() => {
        building.outputsToInventory = true;
      });

      it('should add items to inventory', () => {
        building.inputs = [
          ['foo', 5],
          ['fooOre', 1]
        ];
        building.outputs = [
          ['fooBar', MAX_CRAFT_STORAGE],
          ['fooSlag', 5 * MAX_CRAFT_STORAGE]
        ];
        building.craftItem();
        assert.deepEqual(building.inventory, [
          ['fooBar', 1],
          ['fooSlag', 5]
        ]);
      });

      it('should add items to outputs first', () => {
        building.inputs = [
          ['foo', 5],
          ['fooOre', 1]
        ];
        building.outputs = [
          ['fooBar', MAX_CRAFT_STORAGE - 1],
          ['fooSlag', 5 * MAX_CRAFT_STORAGE - 3]
        ];
        building.craftItem();
        assert.deepEqual(building.outputs, [
          ['fooBar', MAX_CRAFT_STORAGE],
          ['fooSlag', 5 * MAX_CRAFT_STORAGE]
        ]);
        assert.deepEqual(building.inventory, [['fooSlag', 2]]);
      });
    });
  });
});
