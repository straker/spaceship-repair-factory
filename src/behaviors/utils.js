import { removeFromArray } from '../utils/index.js';

/**
 * Add a behavior to a building.
 * @param {String} name - Name of the behavior.
 * @param {Building} building - building to add the behavior to.
 * @param {Object} behavior - Behavior object.
 * @param {Object} options - Options for the behavior.
 */
export function addBehaviorToBuilding(name, building, behavior, options) {
  // new behavior
  if (!building.behaviors[name]) {
    building.behaviors[name] = [];
    behavior.buildings.push(building);
  }

  const buildingBehaviors = building.behaviors[name];
  const behaviorOptions = {
    ...options,
    remove() {
      removeFromArray(buildingBehaviors, behaviorOptions);

      if (buildingBehaviors.length === 0) {
        removeFromArray(behavior.buildings, building);
      }
    }
  };

  buildingBehaviors.push(behaviorOptions);
}
