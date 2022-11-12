import GameObject from './utils/game-object.js';
import { i18n } from './data/translations.js';
// import { items } from './data/items.js';
import { ITEM_SIZE } from './constants.js';
import { removeFromArray } from './utils/index.js';

export const _items = [];
let id = 0;

/**
 * An item on a transport building.
 */
export default class Item extends GameObject {
  constructor(name, properties) {
    properties[0] = name;
    properties[1] = properties.count ?? 0;

    properties.margin = 2;
    properties.width = ITEM_SIZE;
    properties.height = ITEM_SIZE;
    properties.color = name === 'Iron' ? 'purple' : 'red';
    properties.id = ++id;
    properties.render = function () {
      const { context, color, width, height } = this;
      context.fillStyle = color;
      context.strokeStyle = 'white';
      context.fillRect(2, 2, width - 4, height - 4);
      context.strokeRect(2, 2, width - 4, height - 4);
    };

    super(properties);
    _items.push(this);
  }

  get name() {
    return i18n(this._name);
  }

  destroy() {
    removeFromArray(_items, this);
  }

  // allow the item to be iterable so it can be destructured
  // to get the name and count
  // @see https://medium.com/swlh/making-objects-iterable-in-javascript-252d9e270be6
  [Symbol.iterator]() {
    let index = 0;
    const name = this[0];
    const count = this[1];
    return {
      next() {
        switch (index++) {
          case 0:
            return { value: name, done: false };
          case 1:
            return { value: count, done: false };
          default:
            return { done: true };
        }
      }
    };
  }
}

window.Item = Item;
