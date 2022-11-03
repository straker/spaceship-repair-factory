import { loadData } from '../libs/kontra.js';

export const config = {
  mods: [
    // TODO: remove once done testing
    {
      name: 'Foobar',
      items: {
        foobar: {
          raw: true,
          enabled: true,
          type: 'component'
        }
        // Iron: {
        //   stackSize: 1
        // }
      },
      recipes: {
        foobar: {
          enabled: true,
          time: 1,
          inputs: [['Iron', 5]],
          output: [['foobar', 1]]
        }
        // Wire: {
        //   time: 1,
        //   outputs: [['Nickel', 3]]
        // }
      },
      translations: {
        en: {
          foobar: 'Foobar'
        }
      }
    }
  ]
};

export async function initConfig() {
  const data = await loadData('/src/data/config.json');

  config.DEBUG = data.DEBUG;
  // data.mods.forEach(async (modData) => {
  // const mod = await loadData(modData.filePath);
  // });
}
