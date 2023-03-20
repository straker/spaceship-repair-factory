import Behavior from './behavior.js';
import { deepCopy, addToStack, removeFromStack } from '../utils/index.js';
import { MAX_CRAFT_STORAGE } from '../constants.js';

/**
 * Allows a building to craft an item from inputs.
 * @param {Building} building - Object the behavior applies to.
 * @param {Object} options - Behavior options.
 * @param {Number} options.speed=1 - How quickly (as a percent) the building can craft the item.
 */
class CraftItemBehavior extends Behavior {
  constructor() {
    super('craftItem');
  }

  /**
   * Allows a building to craft an item from inputs.
   * @param {Building} building - Object the behavior applies to.
   * @param {Object} options - Behavior options.
   * @param {Number} options.speed=1 - How quickly (as a percent) the building can craft the item.
   */
  add(building, options = {}) {
    // a building can only craft one item at a time, so take
    // the last craft options
    if (!building.behaviors.craftItem) {
      // override existing functions
      building._addItem = building.addItem.bind(building);
      building._removeItem = building.removeItem.bind(building);
      building._canAddItem = building.canAddItem.bind(building);
      building._getItems = building.getItems.bind(building);
      building._getAmountCanAdd = building.getAmountCanAdd.bind(building);

      Object.assign(building, deepCopy(craftingProperties));
      Object.defineProperty(building, 'recipe', {
        get() {
          return this._recipe;
        },
        set(recipe) {
          this.setRecipe(recipe);
        }
      });
    }

    // add required properties to building
    building.maxCraftStorage = options.maxCraftStorage ?? MAX_CRAFT_STORAGE;
    return super.add(building, {
      dt: 0,
      speed: 1,
      ...options
    });
  }

  behavior(building, dt) {
    const {
      crafting,
      inputs,
      outputs,
      recipe,
      maxCraftStorage,
      craftFromInventory,
      outputsToInventory,
      _removeItem,
      _addItem
    } = building;

    if (!recipe) {
      return;
    }

    // start crafting if building has required inputs
    if (!crafting) {
      if (
        !building.hasRequiredInputs() ||
        outputs.some((output, index) => output[1] >= recipe.outputs[index][1] * maxCraftStorage)
      ) {
        return;
      }

      building.crafting = true;

      inputs.forEach((input, index) => {
        let amount = recipe.inputs[index][1];
        amount -= removeFromStack(input, amount, inputs, {
          deleteStack: false
        });

        if (craftFromInventory) {
          _removeItem(input[0], amount);
        }
      });
    }

    const { time } = recipe;
    const craftItem = building.behaviors.craftItem[0];

    // TODO: research can affect crafting time
    craftItem.dt += dt * craftItem.speed;

    if (craftItem.dt < time) {
      return;
    }

    building.crafting = false;
    craftItem.dt -= time;

    recipe.outputs.forEach(([name, amount], index) => {
      const output = outputs[index];
      const max = amount * maxCraftStorage;
      amount -= addToStack(output, amount, max);

      if (outputsToInventory) {
        _addItem(name, amount);
      }
    });
  }
}

const craftItemBehavior = new CraftItemBehavior();
export default craftItemBehavior;

// TODO: should also allow selecting recipe from list
// will need to know which recipes are valid selections
const craftingProperties = {
  inputs: [],
  outputs: [],
  _recipe: null,
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
    // TODO: what should happen to the buildings current input and outputs? right now the items that were produced magically disappear, which I'm not sure is the best approach
    this.inputs = [];
    this.outputs = [];

    this._recipe = recipe;
    recipe.inputs.forEach(([name], index) => {
      this.inputs[index] = [name, 0];
    });

    recipe.outputs.forEach(([name], index) => {
      this.outputs[index] = [name, 0];
    });
    this.behaviors.craftItem.dt = 0;
    this.crafting = false;
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
  },

  /**
   * Get all items in the building.
   * @returns {(String|Number)[][]}
   */
  getItems() {
    // return outputs first
    return this.outputs.concat(this._getItems());
  },

  /**
   * Determine how much room the building has for the item.
   * @param {String} item - Name of the item.
   * @return {Number} The number of items that can be added to the building.
   */
  getAmountCanAdd(item) {
    const {
      inputs,
      recipe,
      maxCraftStorage,
      inputsToInventory,
      _getAmountCanAdd
    } = this;

    let count = inputs.reduce((total, [name, count], index) => {
      const max = recipe.inputs[index][1] * maxCraftStorage;

      if (name !== item) {
        return total;
      }

      return total + (max - count);
    }, 0);

    if (inputsToInventory) {
      count += _getAmountCanAdd(item);
    }

    return count;
  }
};
