import { addBehaviorToBuilding } from './utils.js';
import { deepCopy, addToStack, removeFromStack } from '../utils/index.js';
import { MAX_CRAFT_STORAGE } from '../constants.js';

/**
 * Allows a building to craft an item from inputs.
 * @param {Building} building - Object the behavior applies to.
 * @param {Object} options - Behavior options.
 */
const craftItem = {
  buildings: [],
  add(building, options) {
    // a building can only craft one item at a time
    if (building.behaviors.craftItem) {
      // TODO: warn of second craft
      return;
    }

    // override existing functions
    building._addItem = building.addItem.bind(building);
    building._removeItem = building.removeItem.bind(building);
    building._canAddItem = building.canAddItem.bind(building);

    // add required properties to building
    building.maxCraftStorage = options.maxCraftStorage ?? MAX_CRAFT_STORAGE;
    Object.assign(building, deepCopy(craftingProperties));

    addBehaviorToBuilding('craftItem', building, this, {
      dt: 0,
      ...options
    });
  },
  run(dt) {
    this.buildings.forEach(building => {
      const { recipe, inputs } = building;

      if (!recipe) {
        return;
      }

      // start crafting if building has required inputs
      if (!building.crafting) {
        if (!building.hasRequiredInputs()) {
          return;
        }

        building.crafting = true;
        recipe.inputs.every(([, amount], index) => {
          inputs[index][1] -= amount;
        });
      }

      const { outputs, time } = recipe;
      const { craftItem } = building.behaviors;
      craftItem.dt += dt;

      // can't move an item twice in one update
      if (craftItem.dt < time) {
        return;
      }

      building.crafting = false;

      outputs.forEach(([item, output]) => {
        building.addItem(item, output);
      });
    });
  }
};
export default craftItem;

// TODO: should also allow selecting recipe from list
// will need to know which recipes are valid selections
const craftingProperties = {
  inputs: [],
  outputs: [],
  recipe: null,
  crafting: false,

  // these settings only appear when a building has both
  // inventorySlots and allows crafting

  // allows adding items to inventory if no room in inputs
  inputsToInventory: false,

  // allows adding crafted items to inventory if outputs are full
  outputsToInventory: false,

  // allows taking items from inventory as inputs to craft
  craftFromInventory: false,

  /**
   * Set a recipe to craft.
   * @param {Object} recipe
   */
  setRecipe(recipe) {
    this.inputs = [];
    this.outputs = [];

    this.recipe = recipe;
    recipe.inputs.forEach(([name], index) => {
      this.inputs[index] = [name, 0];
    });

    recipe.outputs.forEach(([name], index) => {
      this.outputs[index] = [name, 0];
    });
  },

  /**
   * Check to see if the building has all required inputs in order to craft it's current recipe.
   * @return {Boolean}
   */
  hasRequiredInputs() {
    if (!this.recipe) {
      return false;
    }

    const { inputs, inventory, recipe, craftFromInventory } = this;
    const counts = [];
    inputs.forEach(([name, count]) => {
      counts.push([name, count]);
    });

    if (craftFromInventory) {
      inventory.forEach(stack => {
        if (!stack) {
          return;
        }

        const [item, amount] = stack;
        const count = counts.find(([name]) => name === item);

        if (!count) {
          return;
        }

        count[1] += amount;
      });
    }

    return counts.every(([, count], index) => {
      return count >= recipe.inputs[index][1];
    });
  },

  /**
   * Determine if building input has room for an item.
   * @param {String} item - Name of the item.
   * @return {Boolean}
   */
  canAddItem(item) {
    const { inputs, recipe, maxCraftStorage, inputsToInventory, _canAddItem } =
      this;
    const canAddToInputs = !!inputs.find(([name, count], index) => {
      return name === item && count < recipe.inputs[index][1] * maxCraftStorage;
    });

    return canAddToInputs || (inputsToInventory && _canAddItem(item));
  },

  /**
   * Craft an item using the building's current recipe.
   */
  craftItem() {
    if (!this.hasRequiredInputs()) {
      return;
    }

    const {
      inputs,
      outputs,
      recipe,
      maxCraftStorage,
      craftFromInventory,
      outputsToInventory,
      _removeItem,
      _addItem
    } = this;

    inputs.forEach((input, index) => {
      let amount = recipe.inputs[index][1];
      amount -= removeFromStack(input, amount, inputs, { deleteStack: false });

      if (craftFromInventory) {
        _removeItem(input[0], amount);
      }
    });

    recipe.outputs.forEach(([name, amount], index) => {
      const output = outputs[index];
      const max = amount * maxCraftStorage;
      amount -= addToStack(output, amount, max);

      if (outputsToInventory) {
        _addItem(name, amount);
      }
    });
  },

  /**
   * Add an item to the building inputs.
   * @param {String} item - Name of the item.
   * @param {Number} amount - How much to add.
   * @return {Number} The number of items that were added.
   */
  addItem(item, amount) {
    const startAmount = amount;
    const { inputs, recipe, maxCraftStorage, inputsToInventory, _addItem } =
      this;
    const index = inputs.findIndex(([name, count], index) => {
      return name === item && count < recipe.inputs[index][1] * maxCraftStorage;
    });

    if (index > -1) {
      const input = inputs[index];
      const max = recipe.inputs[index][1] * maxCraftStorage;

      amount -= addToStack(input, amount, max);
    }

    if (inputsToInventory) {
      amount -= _addItem(item, amount);
    }

    return startAmount - amount;
  },

  /**
   * Remove an item from the building outputs.
   * @param {String} item - Name of the item.
   * @param {Number} amount - How much to remove.
   * @return {Number} The number of items that were removed.
   */
  removeItem(item, amount) {
    const startAmount = amount;
    const { outputs, _removeItem } = this;

    const output = outputs.find(([name]) => name === item);

    // remove logic:
    // 1. take from the outputs first
    // 2. take from inventory second
    if (output) {
      amount -= removeFromStack(output, amount, outputs, {
        deleteStack: false
      });
    }

    if (amount > 0) {
      amount -= _removeItem(item, amount);
    }

    return startAmount - amount;
  }
};

/*
TODO: to figure out:
if building has both inventory and crafting inputs/outputs

- how does adding items work (add to input first, then inventory?)

  items will first add to inputs. if building allows (configuration setting), will add overflow to inventory

- how does crafting items work (add to outputs first, then inventory?)

  items will go to outputs first. if building allows (configuration setting), will add overflow to inventory

- how does taking items work (take from output first, then inventory?)

  items will be taken from output first, inventory second

- if there are no items in inputs, does crafting draw form inventory

  if building config allows it

normally:
- adding items would add to input slots if there is room
- crafted items go to output slots (if there is room)
- taking items takes from output slots


RESULT:

3 building config toggles when building can both craft and has inventory:

- allow inserted items to overflow into inventory
- allow crafted items to overflow into inventory
- allow building to craft from inventory

*/
