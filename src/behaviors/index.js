import craftItemBehavior from './craft-item.js';
import spawnItemBehavior from './spawn-item.js';
import takeItemBehavior from './take-item.js';
import putItemBehavior from './put-item.js';

export const behaviors = {
  craftItem: craftItemBehavior,
  spawnItem: spawnItemBehavior,
  takeItem: takeItemBehavior,
  putItem: putItemBehavior
};

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
