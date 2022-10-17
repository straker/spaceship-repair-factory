import { init, initInput } from './libs/kontra.js';
import { initConfig } from './data/config.js';
import { initComponents } from './data/components.js';
import { initBuildings } from './data/buildings.js';
import { initTasks } from './data/tasks.js';
import { setLang } from './data/translations.js';

// init first so all other files have canvas / context
// available at top-level
init();

async function main() {
  initInput();

  await initConfig(); // must be loaded first
  await setLang('en');
  await initComponents();
  await initBuildings();
  await initTasks();
}

main();
