import { COMPONENTS, START_COMPONENTS } from '../constants';
import buildingCosts from '../building-costs';

let componentStorage = {
  // turn an array into object keys with value 0
  ...COMPONENTS.reduce((acc, curr) => ((acc[curr] = 0), acc), {}),
  ...START_COMPONENTS,

  add({ name, value = 1 }) {
    this[name] += value;
  },

  get(name, value = 1) {
    if (this[name] >= value) {
      this[name] -= value;

      return { name, value };
    }
  },

  canBuy(buildingName) {
    return buildingCosts[buildingName]?.every(({ name, total }) => {
      return this[name] >= total;
    });
  },

  buy(buildingName) {
    buildingCosts[buildingName]?.forEach(({ name, total }) => {
      this[name] -= total;
    });
  },

  sell(buildingName) {
    buildingCosts[buildingName]?.forEach(({ name, total }) => {
      this[name] += total;
    });
  }
};

export default componentStorage;
