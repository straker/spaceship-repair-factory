import { loadData } from '../libs/kontra.js';
import { i18n } from './translations.js';

export const buildings = {};

export async function initBuildings() {
  const data = await loadData('/src/data/buildings.csv');
  const components = data
    .split(/[\n\r]/g)[0]
    .split(',')
    .filter(cell => !!cell);

  data
    .split(/[\n\r]/g)
    .filter((line, index) => index !== 0)
    // remove empty lines
    .filter(line => /\w/.test(line))
    .forEach(entry => {
      const cells = entry.split(',');
      const name = cells[0];

      buildings[name] = {
        get name() {
          return i18n(name);
        },
        cost: cells.reduce((costs, cell, index) => {
          const value = parseInt(cell);

          // ignore building name and empty cells
          if (index < 1 || isNaN(value)) {
            return costs;
          }

          costs.push(components[index - 1], value);
          return costs;
        }, [])
      };
    });

  console.log(buildings);
}
