import GameObject from './utils/game-object.js';
import { radToDeg, SpriteSheet, emit, degToRad } from './libs/kontra.js';
import { i18n } from './data/translations.js';
import { buildings } from './data/buildings.js';
import { items } from './data/items.js';
import { GRID_SIZE, TYPES } from './constants.js';
import { addToStack, removeFromStack } from './utils/index.js';
import { giveBehavior } from './behaviors/index.js';
import grid from './utils/grid.js';

export default class Building extends GameObject {
  constructor(name, properties = {}) {
    const { type, behaviors, ...props } = buildings[name] ?? {};

    if (!TYPES[type]) {
      // TODO: warn of bad type
    }
    const defaultDir = (props.defaultDir ? degToRad(props.defaultDir) : 0);
    let facing = properties.facing ?? properties.rotation;
    if (facing) {
      facing += defaultDir;
    }
    else {
      facing = defaultDir;
    }

    properties = {
      allowRotation: !props.animations || !props.animations['90'],
      ...props,
      ...properties,
      _name: name,
      defaultDir,
      facing,
      type: TYPES.building + (TYPES[type] ? TYPES[type] : 0),
      behaviors: {},
      behaviorsConfig: behaviors,
      anchor: { x: 0, y: 0 },

      /**
       * @property {(String|Number)[][]} inventory - Array of items in the inventory in the format of [ItemName, Quantity].
       */
      inventory: []
    };

    super(properties);

    if (!name) return;

    // give every building the shared behavior
    giveBehavior('shared', this);

    // emit events before adding other behaviors so those
    // behaviors don't trigger events
    emit('building:placed', this);

    behaviors.forEach(([name, options]) => {
      giveBehavior(name, this, options);

      if (options.animation) {
        this._spriteSheet = this._spriteSheet ?? SpriteSheet({
          image: this.image,
          frameWidth: GRID_SIZE,
          frameHeight: GRID_SIZE
        });
        this.image = null;
        this.width = null;
        this.height = null;
        this._spriteSheet.createAnimations({
          [name]: options.animation
        });
        this.animations = this._spriteSheet.animations;
      }
    });
    grid.add(this);

    // auto-play directional animations
    if (this.animations && this.animations[radToDeg(this.facing)]) {
      this.playAnimation(radToDeg(this.facing));
    }
  }

  get name() {
    return i18n(this._name);
  }

  // do not allow setting rotation so we don't rotate the
  // buildings
  set rotation(value) {
    return;
  }
  get rotation() {
    return 0;
  }

  draw() {
    const { context, allowRotation, x, y, width, height, facing } = this;
    context.save();

    if (allowRotation) {
      context.translate(
        width / 2,
        height / 2
      );
      context.rotate(facing - this.defaultDir);
      context.translate(
        -width / 2,
        -height / 2
      );
    }

    super.draw();
    context.restore();
  }

  update(dt) {
    // do not draw animations for buildings that are unpowered
    if (!this.isPowered()) {
      return;
    }

    super.update(dt);
  }

  /**
   * Clean up the building and behaviors.
   */
  destroy() {
    Object.values(this.behaviors).forEach(behaviors => {
      behaviors.forEach(behavior => behavior.remove());
    });
    grid.remove(this);
  }

  /**
   * Determine if building inventory has room for an item.
   * @param {String} item - Name of the item.
   * @return {Boolean}
   */
  canAddItem(item) {
    const { inventory, inventorySlots, maxStackSize } = this;
    const max = maxStackSize || items[item].stackSize;

    for (let i = 0; i < inventorySlots; i++) {
      const slot = inventory[i];

      if (!slot || (slot[0] === item && slot[1] < max)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determine how much room the building has for the item.
   * @param {String} item - Name of the item.
   * @return {Number} The number of items that can be added to the building.
   */
  getAmountCanAdd(item) {
    const { inventory, inventorySlots, maxStackSize } = this;
    const max = maxStackSize || items[item].stackSize;
    let count = 0;

    for (let i = 0; i < inventorySlots; i++) {
      const slot = inventory[i];

      if (!slot) {
        count += max;
        continue;
      }

      if (slot[0] !== item) {
        continue;
      }

      count += max - slot[1];
    }

    return count;
  }

  /**
   * Add an item to the building inventory.
   * @param {String} item - Name of the item.
   * @param {Number} amount - How much to add.
   * @return {Number} The number of items that were added.
   */
  addItem(item, amount) {
    const startAmount = amount;
    const { inventory, inventorySlots, maxStackSize } = this;
    const max = maxStackSize || items[item].stackSize;

    // add logic:
    // find first stack or empty inventory stack
    // 1. if inventory stack, add till full
    // 2. if stack that contains item, add till full
    // 3. repeat till no more to add or no more stacks
    for (let i = 0; amount > 0 && i < inventorySlots; i++) {
      const stack = inventory[i];

      // empty stack
      if (!stack) {
        const toAdd = Math.min(max, amount);
        amount -= toAdd;
        inventory[i] = [item, toAdd];
        continue;
      }

      const [name, count] = stack;

      // not a stack that has the item or room
      if (name !== item || count >= max) {
        continue;
      }

      amount -= addToStack(stack, amount, max);
    }

    return startAmount - amount;
  }

  /**
   * Remove an item from the building inventory.
   * @param {String} item - Name of the item.
   * @param {Number} amount - How much to remove.
   * @return {Number} The number of items that were removed.
   */
  removeItem(item, amount) {
    const startAmount = amount;
    const { inventory, inventorySlots } = this;

    // remove logic:
    // 1. take from the last inventory stack with the item
    // 2. repeat till no more to remove or no more stacks
    for (let i = inventorySlots - 1; amount > 0 && i >= 0; i--) {
      const stack = inventory[i];

      // empty stack
      if (!stack) {
        continue;
      }

      const [name] = stack;

      // not a stack with the item
      if (name !== item) {
        continue;
      }

      amount -= removeFromStack(stack, amount, inventory, {
        deleteStack: true
      });
    }

    return startAmount - amount;
  }

  /**
   * Get all items in the building.
   * @returns {(String|Number)[][]}
   */
  getItems() {
    return this.inventory.filter(item => !!item).reverse();
  }

  /**
   * Determine if a building is powered.
   * @returns {Boolean}
   */
  isPowered() {
    return this.requiresPower
      ? this.poweredBy.length > 0
      : true;
  }
}

window.Building = Building;
