import Behavior from './behavior.js';
import grid from '../utils/grid.js';
import {
  deepCopy,
  pointInsideCircle,
  getTilesInCircle,
  getDimensions,
  forEachTileInCircle
} from '../utils/index.js';
import { TYPES, GRID_SIZE } from '../constants.js';
import { on, off } from '../libs/kontra.js';

function fillCricle(building, radius) {
  const tiles = getTilesInCircle({
    y: building.center.y - building.y,
    x: building.center.x - building.x
  }, radius);
  const r = building.center.x % GRID_SIZE === 0 ? radius : radius + 0.5;

  building.context.save();
  building.context.beginPath();
  building.context.strokeStyle = 'red';
  building.context.arc(building.center.x, building.center.y, (r) * GRID_SIZE, 0, Math.PI*2);
  building.context.stroke();

  building.context.fillStyle = 'yellow';
  building.context.globalAlpha = 0.5;
  tiles.forEach(({row, col}) => {
    building.context.fillRect((col + building.col) * GRID_SIZE, (row + building.row) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  });
  building.context.restore();
}

class GeneratePowerBehavior extends Behavior {
  constructor() {
    super('generatePower');
  }

  /**
   * Allows a building to generate power.
   * @param {Building} building - Building the behavior applies to.
   * @param {Object} options - Behavior options.
   * @param {Number} options.amount - The amount of power generated.
   * @param {Number} options.range - Range (in number of tiles) to power buildings.
   */
  add(building, options = {}) {
    Object.assign(building, deepCopy(generatePowerProperties));

    building.type += TYPES.power;
    /*
      how do i want this to work?
      - checking if a building is within a power building range should only happen when a building has been placed or deleted (no need to check it every frame).
        - need a list of all power buildings, then loop through them to see if any are within range. this works when a non-power building is placed. but what happens when a power building is placed? will need to loop through the grid for it's range and mark all buildings as being powered
      - checking if there is enough power to power all buildings should also happen when a building has been placed or deleted
      - will need a total amount of power generated and total amount of power draw
    */

    // on('updatePower', () => {

    // });
    const { radius } = options;

    // find all buildings within the power range and mark them
    // as being powered
    getTilesInCircle({
      y: building.center.y - building.y,
      x: building.center.x - building.x
    }, radius).forEach(({row, col}) => {
      const bld = grid.getByType({
        row: building.row + row,
        col: building.col + col
      }, TYPES.building)[0];
      if (bld) {
        building.powerBuilding(bld);
      }
    });

    building.onBuildingPlaced = building.onBuildingPlaced.bind(building);
    on('building:placed', building.onBuildingPlaced);

    const render = building.render.bind(building);
    building.render = function() {
      const generatePower = building.behaviors.generatePower[0];
      const { input, radius } = generatePower;

      render();
      if (window.DEBUG) {
        fillCricle(building, radius);
      }
    };

    return super.add(building, {
      ...options
    });
  }

  remove(building, behavior) {
    super.remove(building, behavior);
    off('building:placed', building.onBuildingPlaced);
  }

  behavior(building, dt) {
    const generatePower = building.behaviors.generatePower[0];
    const { input, radius } = generatePower;
  }
}

const generatePowerBehavior = new GeneratePowerBehavior();
export default generatePowerBehavior;

const generatePowerProperties = {
  powering: [],

  /**
   * Power a building.
   * @param {Building} building - Building to give power to.
   */
  powerBuilding(building) {
    const sharedBehavior = building.behaviors.shared[0];

    // don't power other power buildings
    if (building.type & TYPES.power) {
      return;
    }

    this.powering.push(building);
    sharedBehavior.poweredBy.push(this);
  },

  /**
   * Check that a placed building is within the power radius.
   * @param {Building} building - Building to check.
   */
  onBuildingPlaced(building) {
    const { radius } = this.behaviors.generatePower[0];

    let isPowered = false;
    forEachTileInCircle(getDimensions(building), this.center, radius, () => {
      isPowered = true;
    });

    if (isPowered) {
      this.powerBuilding(building);
    }
  }
};