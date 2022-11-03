import Building from '../../src/building.js';
import { buildings } from '../../src/data/buildings.js';
import { items } from '../../src/data/items.js';
import { MAX_CRAFT_STORAGE } from '../../src/constants.js';
import craftItemBehavior from '../../src/behaviors/craft-item.js';

describe('behaviors.craft-item', () => {
  let building;
  let max;

  beforeEach(() => {
    buildings.foo = {
      inventorySlots: 5,
      behaviors: []
    };

    building = new Building('foo');
    craftItemBehavior.add(building);

    building?.setRecipe({
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
    max = building?.recipe.inputs[0][1] * MAX_CRAFT_STORAGE;

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
  });

  afterEach(() => {
    building?.destroy();
    building = null;

    delete buildings.foo;
    delete items.foo;
    delete items.fooOre;
    delete items.fooBar;
    delete items.fooSlag;
  });

  function resetRecipe() {
    building._recipe = null;
    building.inputs = [];
    building.outputs = [];
  }

  describe('behavior', () => {
    describe('add', () => {
      it('should give building required functionality', () => {
        building = new Building('foo');
        craftItemBehavior.add(building);
        assert.typeOf(building.inputs, 'array');
        assert.typeOf(building.outputs, 'array');
        assert.typeOf(building.crafting, 'boolean');
        assert.typeOf(building.inputsToInventory, 'boolean');
        assert.typeOf(building.outputsToInventory, 'boolean');
        assert.typeOf(building.craftFromInventory, 'boolean');
        assert.typeOf(building.setRecipe, 'function');
        assert.typeOf(building.hasRequiredInputs, 'function');
        assert.equal(building.maxCraftStorage, MAX_CRAFT_STORAGE);
      });

      it('should only allow one', () => {
        building = new Building('foo');
        craftItemBehavior.add(building, { foo: 1 });
        craftItemBehavior.add(building, { bar: 2 });
        assert.lengthOf(building.behaviors.craftItem, 1);
        assert.equal(building.behaviors.craftItem[0].bar, 2);
      });

      it('should not override functionality twice', () => {
        building = new Building('foo');
        craftItemBehavior.add(building);
        craftItemBehavior.add(building);
        assert.notEqual(building.addItem, building._addItem);
        assert.notEqual(building.removeItem, building._removeItem);
        assert.notEqual(building.canAddItem, building._canAddItem);
        assert.notEqual(building.getItems, building._getItems);
      });

      it('should set recipe correctly', () => {
        building = new Building('foo');
        craftItemBehavior.add(building);
        const spy = sinon.spy(building, 'setRecipe');
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
        building.recipe = recipe;
        assert.isTrue(spy.calledWith(recipe));
      });
    });

    describe('behavior', () => {
      it('should take from inputs', () => {
        building.inputs = [
          ['foo', 5],
          ['fooOre', 1]
        ];
        craftItemBehavior._behavior(building, 1);
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
        craftItemBehavior._behavior(building, 1);
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
        craftItemBehavior._behavior(building, 1);
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
        craftItemBehavior._behavior(building, 1);
        assert.deepEqual(building.inventory, []);
      });

      it('should not craft item if no recipe is set', () => {
        resetRecipe();
        building.inputs = [
          ['foo', 5],
          ['fooOre', 1]
        ];
        craftItemBehavior._behavior(building, 1);
        assert.deepEqual(building.outputs, []);
      });

      it('should take from inputs while crafting but not craft outputs', () => {
        building.inputs = [
          ['foo', 5],
          ['fooOre', 1]
        ];
        craftItemBehavior._behavior(building, 0.2);
        assert.deepEqual(building.inputs, [
          ['foo', 0],
          ['fooOre', 0]
        ]);
        assert.deepEqual(building.outputs, [
          ['fooBar', 0],
          ['fooSlag', 0]
        ]);
      });

      it('should not take from inputs until crafting stops', () => {
        building.inputs = [
          ['foo', 10],
          ['fooOre', 2]
        ];
        craftItemBehavior._behavior(building, 0.2);
        craftItemBehavior._behavior(building, 0.2);
        assert.deepEqual(building.inputs, [
          ['foo', 5],
          ['fooOre', 1]
        ]);
        assert.deepEqual(building.outputs, [
          ['fooBar', 0],
          ['fooSlag', 0]
        ]);
      });

      it('should reset craft timer when crafting is complete', () => {
        building.inputs = [
          ['foo', 10],
          ['fooOre', 2]
        ];
        craftItemBehavior._behavior(building, 0.75);
        assert.equal(building.behaviors.craftItem.dt, 0);
        assert.isFalse(building.crafting);
      });

      it('should take into account crafting speed', () => {
        building.behaviors.craftItem[0].speed = 2;
        building.inputs = [
          ['foo', 5],
          ['fooOre', 1]
        ];
        craftItemBehavior._behavior(building, 0.25);
        assert.deepEqual(building.outputs, [
          ['fooBar', 1],
          ['fooSlag', 5]
        ]);
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
          craftItemBehavior._behavior(building, 1);
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
          craftItemBehavior._behavior(building, 1);
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
          craftItemBehavior._behavior(building, 1);
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
          craftItemBehavior._behavior(building, 1);
          assert.deepEqual(building.outputs, [
            ['fooBar', MAX_CRAFT_STORAGE],
            ['fooSlag', 5 * MAX_CRAFT_STORAGE]
          ]);
          assert.deepEqual(building.inventory, [['fooSlag', 2]]);
        });
      });
    });
  });

  describe('functionality', () => {
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

      it('should reset craft timer', () => {
        building.behaviors.craftItem.dt = 1;
        building.setRecipe(recipe);
        assert.equal(building.behaviors.craftItem.dt, 0);
        assert.isFalse(building.crafting);
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
          building.inventory = [
            undefined,
            ['foo', 5],
            undefined,
            ['fooOre', 1]
          ];
          assert.isTrue(building.hasRequiredInputs());
        });

        it('should return false if inventory does not have required inputs', () => {
          building.inventory = [
            undefined,
            ['foo', 4],
            undefined,
            ['fooOre', 1]
          ];
          assert.isFalse(building.hasRequiredInputs());
        });

        it('should return true if inputs and inventory has required inputs', () => {
          building.inputs = [
            ['foo', 1],
            ['fooOre', 0]
          ];
          building.inventory = [
            undefined,
            ['foo', 4],
            undefined,
            ['fooOre', 1]
          ];
          assert.isTrue(building.hasRequiredInputs());
        });
      });
    });

    describe('getItems', () => {
      it('should return all items, outputs first', () => {
        building.inventory = [
          ['Iron', 95],
          undefined,
          ['Iron Ore', 5],
          undefined,
          undefined
        ];
        building.outputs = [['fooBar', 5]];
        const items = building.getItems();
        assert.deepEqual(items, [
          ['fooBar', 5],
          ['Iron Ore', 5],
          ['Iron', 95]
        ]);
      });
    });

    describe('getAmountCanAdd', () => {
      it('should return the total number of the item that can be added', () => {
        building.inputs = [
          ['foo', 3],
          ['fooOre', 0]
        ];

        const amount = building.getAmountCanAdd('foo');
        assert.equal(amount, 12);
      });

      describe('inputsToInventory', () => {
        beforeEach(() => {
          building.inputsToInventory = true;
        });

        it('should include inventory', () => {
          building.inputs = [
            ['foo', 3],
            ['fooOre', 0]
          ];
          building.inventory = [
            ['Iron', 95],
            undefined,
            ['Iron Ore', 5],
            undefined,
            undefined
          ];

          const amount = building.getAmountCanAdd('foo');
          assert.equal(amount, 312);
        });
      });
    });
  });
});
