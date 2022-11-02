import { init as initKontra } from '../src/libs/kontra.js';

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 600;
document.body.appendChild(canvas);
initKontra();

let grid;

before(async () => {
  const init = (await import('../src/init.js')).default;
  await init();
  grid = (await import('../src/utils/grid.js')).default;
});

afterEach(() => {
  grid._reset();
});
