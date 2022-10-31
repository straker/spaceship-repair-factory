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
        removeFromArray(buildingBehaviors, behaviorOptions);

        if (buildingBehaviors.length === 0) {
          removeFromArray(buildings, building);
        }
      }
    };

    buildingBehaviors.push(behaviorOptions);
  }

  /**
   * Run the behavior for each building.
   * @param {Number} dt - Time update.
   */
  run(dt) {
    this.buildings.forEach(building => {
      this._behavior(building, dt);
    });
  }

  /**
   * Abstract function. Execute the behavior on the building.
   * @private
   * @param {Building} building - building to execute behavior on.
   * @param {Number} dt - Time update.
   */
  _behavior() {}
}
