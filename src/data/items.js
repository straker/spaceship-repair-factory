import { loadData } from '../libs/kontra.js';
import { i18n } from './translations.js';
import { config } from './config.js';
import { TYPES } from '../constants.js';
import { CSV } from '../libs/csv.js';
import { addModChanges } from '../utils/index.js';

export const items = {};
export const recipes = {};

/**
 * Initialize item and recipe data and mods.
 */
export async function initItems() {
  const data = await loadData('/src/data/items.csv');
  const metaEndCol = 4;
  const parsedData = CSV.parse(data);

  const itemNames = parsedData[0].filter(
    (cell, index) => !!cell && index > metaEndCol
  );

  parsedData
    .filter((line, index) => index !== 0)
    // remove empty lines
    .filter(line => line.some(cell => !!cell))
    .forEach(cells => {
      const name = cells[0];
      const type = TYPES[cells[1]];
      const stackSize = parseInt(cells[2]);
      const output = parseInt(cells[3]);
      const time = parseFloat(cells[4]);

      // TODO: how to determine when items are available?
      // need to be tied to the research tree
      createItem(name, {
        enabled: true,
        type,
        stackSize,
        raw: !output
      });

      if (!output) {
        return;
      }

      // TODO: how to determine when recipes are available?
      // need to be tied to the research tree
      createRecipe(name, {
        enabled: true,
        outputs: [[name, output]],
        time,
        inputs: cells.reduce((inputs, cell, index) => {
          const value = parseInt(cell);

          // ignore item name, output, time, and empty
          // cells
          if (index <= metaEndCol || isNaN(value)) {
            return inputs;
          }

          inputs.push([itemNames[index - (metaEndCol + 1)], value]);
          return inputs;
        }, [])
      });
    });

  createRecipe('none', {
    enabled: true,
    time: Infinity,
    inputs: [],
    outputs: []
  });

  // load mods
  config.mods.forEach(mod => {
    if (mod.items) {
      Object.entries(mod.items).forEach(([key, value]) => {
        createItem(key, { ...value, mod: mod.name });
      });
    }

    if (mod.recipes) {
      Object.entries(mod.recipes).forEach(([key, value]) => {
        createRecipe(key, { ...value, mod: mod.name });
      });
    }
  });

  // TODO: remove
  // console.info('recipes:', recipes);
  // console.info('items:', items);
  window.items = items;
  window.recipes = recipes;
}

/**
 * Create a item or update an existing item.
 * @param {String} name - Name of the item. Also used as the translation key.
 * @param {Object} props - Properties of the items.
 * @param {Boolean} props.raw - If the item is a raw item.
 * @param {Number} props.type - Type of the item.
 * @param {Boolean} props.enabled - If the item should start enabled.
 * @param {Number} props.stackSize - Quantity of the item that can stack into a single inventory slot.
 * @param {String} [props.mod] - Name of the mod creating the item.
 * @param {...*} props.* - Any other properties
 */
function createItem(name, props) {
  if (typeof props.type === 'string') {
    props.type = TYPES[props.type];
  }

  if (items[name]) {
    items[name] = addModChanges(items[name], props);
  } else {
    items[name] = {
      get name() {
        return i18n(name);
      },
      ...props
    };
  }

  return items[name];
}

/**
 * Create a recipe or update an existing recipe.
 * @param {String} name - Name of the recipe. Also used as the translation key.
 * @param {Object} props - Properties of the recipe.
 * @param {Boolean} props.enabled - If the recipe should start enabled.
 * @param {Number} time - Time in seconds to craft the recipe.
 * @param {(String|Number)[][]} inputs - Required inputs to craft the recipe, in the format of Array<[ItemName, Quantity]>.
 * @param {(String|Number)[][]} output - Items produced when crafted, in the format of Array<[ItemName, Quantity]>.
 * @param {String} [props.mod] - Name of the mod creating the recipe.
 * @param {...*} props.* - Any other properties
 */
function createRecipe(name, props) {
  if (recipes[name]) {
    recipes[name] = addModChanges(recipes[name], props);
  } else {
    recipes[name] = {
      get name() {
        return i18n(name);
      },
      ...props
    };
  }

  return recipes[name];
}
