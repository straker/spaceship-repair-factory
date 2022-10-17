import { loadData } from '../libs/kontra.js';
import { i18n } from './translations.js';
import { config } from './config.js';

export const components = {};
export const recipes = {};

/**
 * Initialize component and recipe data and mods.
 */
export async function initComponents() {
  const data = await loadData('/src/data/components.csv');

  const componentNames = data
    .split(/[\n\r]/g)[0]
    .split(',')
    .filter((cell, index) => !!cell && index > 2);

  data
    .split(/[\n\r]/g)
    .filter((line, index) => index !== 0)
    // remove empty lines
    .filter(line => /\w/.test(line))
    .forEach(entry => {
      const cells = entry.split(',');
      const name = cells[0];
      const output = parseInt(cells[1]);

      // TODO: how to determine when components are available?
      // need to be tied to the research tree
      createComponent(name, {
        raw: !output,
        enabled: true
      });

      if (!output) {
        return;
      }

      // TODO: how to determine when recopies are available?
      // need to be tied to the research tree
      createRecipe(name, {
        enabled: true,
        output: parseInt(cells[1]),
        time: parseFloat(cells[2]),
        inputs: cells.reduce((inputs, cell, index) => {
          const value = parseInt(cell);

          // ignore component name, output, time, and empty
          // cells
          if (index < 3 || isNaN(value)) {
            return inputs;
          }

          inputs.push(componentNames[index - 3], value);
          return inputs;
        }, [])
      });
    });

  createRecipe('none', {
    enabled: true,
    time: Infinity,
    inputs: [],
    output: 0
  });

  // load mods. mods are only able to create new components
  // and recipes and cannot disable or remove ones
  config.mods.forEach(mod => {
    if (mod.components) {
      Object.entries(mod.components).forEach(([key, value]) => {
        createComponent(key, { ...value, fromMod: mod.name });
      });
    }

    if (mod.recipes) {
      Object.entries(mod.recipes).forEach(([key, value]) => {
        createRecipe(key, { ...value, fromMod: mod.name });
      });
    }
  });

  // TODO: remove
  console.log(recipes);
  console.log(components);
}

/**
 * Create a component.
 * @param {String} name - Name of the component. Also used as the translation key.
 * @param {Object} props - Properties of the components.
 * @param {Boolean} props.raw - If the component is a raw component.
 * @param {Boolean} props.enabled - If the component should start enabled.
 * @param {String} [props.fromMod] - Name of the mod creating the component.
 * @param {...*} props.* - Any other properties
 */
function createComponent(name, props) {
  if (components[name]) {
    // TODO: report debug

    return;
  }

  components[name] = {
    get name() {
      return i18n(name);
    },
    ...props
  };
}

/**
 * Create a recipe.
 * @param {String} name - Name of the recipe. Also used as the translation key.
 * @param {Object} props - Properties of the recipe.
 * @param {Boolean} props.enabled - If the recipe should start enabled.
 * @param {Number} time - Time in seconds to craft the recipe.
 * @param {(String|Number)[]} inputs - Required inputs to craft the recipe in the format of [ComponentName, Quantity].
 * @param {Number} output - Quantity produced when crafted.
 * @param {String} [props.fromMod] - Name of the mod creating the component.
 * @param {...*} props.* - Any other properties
 */
function createRecipe(name, props) {
  let recipe = recipes[name];
  if (!recipe) {
    recipe = recipes[name] = {
      get name() {
        return i18n(name);
      },
      recipes: []
    };
  }

  recipe.recipes.push(props);
}
