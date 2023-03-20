import consumePowerBehavior from './consume-power.js';
import craftItemBehavior from './craft-item.js';
import destroyItemBehavior from './destroy-item.js';
import generatePowerBehavior from './generate-power.js';
import putItemBehavior from './put-item.js';
import sharedBehavior from './shared.js';
import spawnItemBehavior from './spawn-item.js';
import takeItemBehavior from './take-item.js';
import transportItemBehavior from './transport-item.js';

const behaviors = {
  consumePower: consumePowerBehavior,
  craftItem: craftItemBehavior,
  destroyItem: destroyItemBehavior,
  generatePower: generatePowerBehavior,
  putItem: putItemBehavior,
  shared: sharedBehavior,
  spawnItem: spawnItemBehavior,
  takeItem: takeItemBehavior,
  transportItem: transportItemBehavior
};

// TODO: let this list be editable by mods
const defaultBehaviorOrder = [
  'shared',
  'generatePower',
  'consumePower',
  'destroyItem',
  'spawnItem',
  'takeItem',
  'putItem',
  'craftItem',
  'transportItem'
];
export const behaviorOrder = defaultBehaviorOrder.map(name => behaviors[name]);

/**
 * Give a behavior to an building.
 * @param {String} name - Name of the behavior.
 * @param {Building} building - building to give behavior to.
 * @param {Object} options - Options for the behavior (see behavior list for which options are required for which behaviors).
 */
export function giveBehavior(name, building, options) {
  if (!behaviors[name]) {
    // TODO: warn user
  }

  behaviors[name].add(building, options);
}

window.giveBehavior = giveBehavior;
window.behaviors = behaviors;
