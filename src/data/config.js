import { loadData } from '../libs/kontra.js';

export const config = {
  mods: [
    // TODO: remove once done testing
    {
      name: 'Foobar',
      components: {
        foobar: {
          raw: true,
          enabled: true
        }
      },
      recipes: {
        foobar: {
          enabled: true,
          time: 1,
          inputs: ['Iron', 5],
          output: 1
        }
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
