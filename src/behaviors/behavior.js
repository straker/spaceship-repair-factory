import { removeFromArray } from '../utils/index.js';

export default class Behavior {
  constructor(name) {
    this.name = name;
    this.buildings = [];
  }

  /**
   * Add a behavior to a building.
   * @param {Building} building - building to add the behavior to.
   * @param {Object} options - Options for the behavior.
   * @param {Boolean} options.allowMultiple - If the building can have more than one of the behavior.
   */
  add(building, options = {}) {
    const { name, buildings } = this;
    const _this = this;

    if (!building.behaviors[name]) {
      building.behaviors[name] = [];
      buildings.push(building);
    } else if (!options.allowMultiple) {
      building.behaviors[name][0].remove();
    }

    const buildingBehaviors = building.behaviors[name];
    const behaviorOptions = {
      ...options,

      /**
       * Remove the behavior from the building.
       */
      remove() {
        _this.remove(building, behaviorOptions);
      }
    };

    buildingBehaviors.push(behaviorOptions);
    return behaviorOptions;
  }

  remove(building, behavior) {
    const { name, buildings } = this;
    removeFromArray(building.behaviors[name], behavior);

    if (building.behaviors[name].length === 0) {
      removeFromArray(buildings, building);
    }
  }

  /**
   * Run the behavior for each building.
   * @param {Number} dt - Time update.
   */
  run(dt) {
    this.buildings.forEach(building => {
      const shared = building.behaviors.shared[0];
      if (shared.cooldown) {
        return;
      }

      if (building.requiredPower && !shared.isPowered) {
        return;
      }

      this.behavior(building, dt);
    });
  }

  /**
   * Abstract function. Execute the behavior on the building.
   * @private
   * @param {Building} building - building to execute behavior on.
   * @param {Number} dt - Time update.
   */
  behavior() {}
}
