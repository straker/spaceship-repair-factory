import { init as initKontra } from '../src/libs/kontra.js';

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 600;
document.body.appendChild(canvas);
initKontra();

before(async () => {
  const init = (await import('../src/init.js')).default;
  await init();
});
