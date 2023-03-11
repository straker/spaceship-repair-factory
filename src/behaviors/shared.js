import Behavior from './behavior.js';

class SharedBehavior extends Behavior {
  constructor() {
    super('shared');
  }

  /**
   * A set of shared behavior properties that any behavior can use and modify.
   * @param {Building} building - Building the behavior applies to.
   */
  add(building) {
    return super.add(building, {
      // setting a cooldown will prevent other behaviors from
      // activating until the cooldown has expired
      cooldown: 0,

      // buildings that require power and are not powered will
      // prevent other behaviors from activating
      poweredBy: []
    });
  }

  /**
   * Always run the shared behavior
   * @param {Number} dt - Time update.
   */
  run(dt) {
    this.buildings.forEach(building => {
      this.behavior(building, dt);
    });
  }

  behavior(building, dt) {
    const shared = building.behaviors.shared[0];

    if (shared.cooldown > 0) {
      shared.cooldown -= dt;

      if (shared.cooldown < 0) {
        shared.cooldown = 0;
      }
    }

    shared.isPowered = shared.poweredBy.length > 0;
  }
}

const sharedBehavior = new SharedBehavior();
export default sharedBehavior;
