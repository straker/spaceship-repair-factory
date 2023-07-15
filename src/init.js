import { init as initKontra, initInput, load, setImagePath } from './libs/kontra.js';
import { initConfig } from './data/config.js';
import { initItems } from './data/items.js';
import { initBuildings } from './data/buildings.js';
import { initTasks } from './data/tasks.js';
import { setLang } from './data/translations.js';

// init first so all other files have canvas / context
// available at top-level
const { canvas, context } = initKontra();

export default async function init() {
  const { pointer } = initInput();

  setImagePath('/src/assets')

  await initConfig(); // must be loaded first
  await setLang('en');
  await initItems();
  await initBuildings();
  await initTasks();

  await load('icons.png')

  return { canvas, context, pointer };
}
