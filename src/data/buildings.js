import { loadData, loadImage } from '../libs/kontra.js';
import { CSV } from '../libs/csv.js';
import { config } from './config.js';
import { addModChanges } from '../utils/index.js';

export const buildings = {};

export async function initBuildings() {
  const data = await loadData('/src/data/buildings.csv');
  let lastEntry;

  CSV.parse(data)
    .filter((line, index) => index !== 0)
    // remove empty lines
    .filter(line => line.some(cell => !!cell))
    .forEach(cells => {
      const name = cells[0];
      const type = cells[1];
      const inventorySlots = cells[2];
      const maxStackSize = cells[3];
      const image = cells[4];
      const behavior = cells[5];
      const behaviorOptions = cells[6] ? JSON.parse(cells[6]) : {};

      // use last entry to add multiple behaviors to a building
      if (!name) {
        lastEntry.behaviors.push([behavior, behaviorOptions]);
        return;
      }

      const building = createBuilding(name, {
        enabled: true,
        type,
        inventorySlots,
        maxStackSize,
        image,
        behaviors: behavior ? [[behavior, behaviorOptions]] : []
      });

      lastEntry = building;
    });

  // buildings need to give a cost, as well as list behaviors,
  // actions, and properties
  // examples:
  // power buildings: need to list that they generate
  // power, the amount, and power radius
  // assemblers: need to list which recipes they can select from
  // that they take inputs, produce outputs, etc.
  // belts: need to list that they can create segments, move
  // components, etc.
  // what if a mod wants to create an entirely new type? can't
  // as the game wouldn't know what to do with it

  // load mods
  config.mods.forEach(mod => {
    if (mod.buildings) {
      Object.entries(mod.buildings).forEach(async ([key, value]) => {
        await createBuilding(key, { ...value, mod: mod.name });
      });
    }
  });

  // console.info('buildings:', buildings);
}

/**
 * Create a building or update an existing building.
 * @param {String} name - Name of the building. Also used as the translation key.
 * @param {Object} props - Properties of the building.
 * @param {Boolean} props.enabled - If the building should start enabled.
 * @param {Boolean} props.type - Type of the building.
 * @param {Number} [props.inventorySlots=0] - Number of inventory slots the building has.
 * @param {Number} - [props.maxStackSize] - If set, the max stack size the building allows.
 * @param {String} image - Path to the image asset for the building.
 * @param {(String|Number)[][]} behaviors - behaviors for the building, in the format of Array<[BehaviorName, BehaviorOptions]>.
 * @param {String} [props.mod] - Name of the mod creating the building.
 * @param {...*} props.* - Any other properties
 */
function createBuilding(name, props) {
  if (!props.inventorySlots) {
    props.inventorySlots = 0;
  }

  if (!props.maxStackSize) {
    props.maxStackSize = false;
  }

  if (buildings[name]) {
    buildings[name] = addModChanges(buildings[name], props);
  } else {
    buildings[name] = props;
  }

  // asynchronously load images
  if (props.image) {
    loadImage(props.image).then(image => {
      buildings[name].image = image;
    });
  }

  return buildings[name];
}