import { init as initKontra, initInput } from './libs/kontra.js';
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

  await initConfig(); // must be loaded first
  await setLang('en');
  await initItems();
  await initBuildings();
  await initTasks();
  return { canvas, context, pointer };
}
