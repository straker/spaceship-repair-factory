import init from './init.js';
import { GameLoop } from './libs/kontra.js';
import grid from './utils/grid.js';
import { behaviors } from './behaviors/index.js';
import { GRID_SIZE } from './constants.js';
import Building from './building.js';
import { _items } from './item.js';

async function main() {
  const { canvas, context } = await init();

  GameLoop({
    // fps: 15,
    update(dt) {
      // behaviors.spawnItem.run(dt);
      // behaviors.takeItem.run(dt);
      // behaviors.putItem.run(dt);
      // behaviors.craftItem.run(dt);
      behaviors.transportItem.run(dt);
      grid.update();
      _items.forEach(item => item.update());
    },
    render() {
      grid.render();
      _items.forEach(item => item.render());

      if (window.DEBUG) {
        context.strokeStyle = 'grey';
        context.lineHeight = 2;
        context.beginPath();
        for (let r = 0; r < canvas.height / GRID_SIZE; r++) {
          context.moveTo(0, r * GRID_SIZE);
          context.lineTo(canvas.width, r * GRID_SIZE);
        }
        for (let c = 0; c < canvas.width / GRID_SIZE; c++) {
          context.moveTo(c * GRID_SIZE, 0);
          context.lineTo(c * GRID_SIZE, canvas.height);
        }
        context.stroke();
      }
    }
  }).start();
  // window.DEBUG=true
  window.belt = new Building('Belt I', {
    id: 1,
    x: 32 * 6 + 32 / 2,
    y: 32 * 4 + 32 / 2
  });
  window.belt2 = new Building('Belt I', {
    id: 2,
    x: 32 * 7 + 32 / 2,
    y: 32 * 4 + 32 / 2
  });
  window.belt3 = new Building('Belt I', {
    id: 3,
    x: 32 * 8 + 32 / 2,
    y: 32 * 4 + 32 / 2
  });
  window.belt4 = new Building('Belt I', {
    id: 4,
    x: 32 * 9 + 32 / 2,
    y: 32 * 1 + 32 / 2,
    rotation: Math.PI / 2
  });
  window.belt5 = new Building('Belt I', {
    id: 5,
    x: 32 * 9 + 32 / 2,
    y: 32 * 2 + 32 / 2,
    rotation: Math.PI / 2
  });
  window.belt6 = new Building('Belt I', {
    id: 6,
    x: 32 * 9 + 32 / 2,
    y: 32 * 3 + 32 / 2,
    rotation: Math.PI / 2
  });
  window.belt7 = new Building('Belt I', {
    id: 7,
    x: 32 * 9 + 32 / 2,
    y: 32 * 4 + 32 / 2,
    rotation: Math.PI / 2
  });
  window.belt8 = new Building('Belt I', {
    id: 8,
    x: 32 * 9 + 32 / 2,
    y: 32 * 5 + 32 / 2,
    rotation: Math.PI / 2
  });
  window.belt9 = new Building('Belt I', {
    id: 9,
    x: 32 * 9 + 32 / 2,
    y: 32 * 0 + 32 / 2,
    rotation: Math.PI / 2
  });
  window.belt18 = new Building('Belt I', {
    id: 18,
    x: 32 * 5 + 32 / 2,
    y: 32 * 6 + 32 / 2
  });
  window.belt17 = new Building('Belt I', {
    id: 17,
    x: 32 * 6 + 32 / 2,
    y: 32 * 6 + 32 / 2
  });
  window.belt10 = new Building('Belt I', {
    id: 10,
    x: 32 * 7 + 32 / 2,
    y: 32 * 6 + 32 / 2
  });
  window.belt11 = new Building('Belt I', {
    id: 11,
    x: 32 * 8 + 32 / 2,
    y: 32 * 6 + 32 / 2
  });
  window.belt12 = new Building('Belt I', {
    id: 12,
    x: 32 * 9 + 32 / 2,
    y: 32 * 6 + 32 / 2
  });
  window.belt13 = new Building('Belt I', {
    id: 13,
    x: 32 * 10 + 32 / 2,
    y: 32 * 6 + 32 / 2
  });
  window.belt14 = new Building('Belt I', {
    id: 14,
    x: 32 * 11 + 32 / 2,
    y: 32 * 6 + 32 / 2
  });
  window.belt15 = new Building('Belt I', {
    id: 15,
    x: 32 * 12 + 32 / 2,
    y: 32 * 6 + 32 / 2
  });
  window.belt16 = new Building('Belt I', {
    id: 16,
    x: 32 * 13 + 32 / 2,
    y: 32 * 6 + 32 / 2
  });
  window.belt19 = new Building('Belt I', {
    id: 19,
    x: 32 * 14 + 32 / 2,
    y: 32 * 6 + 32 / 2,
    rotation: (Math.PI * 3) / 2
  });
  window.belt20 = new Building('Belt I', {
    id: 20,
    x: 32 * 14 + 32 / 2,
    y: 32 * 5 + 32 / 2,
    rotation: (Math.PI * 3) / 2
  });
  window.belt21 = new Building('Belt I', {
    id: 21,
    x: 32 * 14 + 32 / 2,
    y: 32 * 4 + 32 / 2,
    rotation: (Math.PI * 3) / 2
  });
  window.belt22 = new Building('Belt I', {
    id: 22,
    x: 32 * 14 + 32 / 2,
    y: 32 * 3 + 32 / 2,
    rotation: Math.PI
  });
  window.belt23 = new Building('Belt I', {
    id: 23,
    x: 32 * 13 + 32 / 2,
    y: 32 * 3 + 32 / 2,
    rotation: Math.PI
  });
  window.belt24 = new Building('Belt I', {
    id: 24,
    x: 32 * 12 + 32 / 2,
    y: 32 * 3 + 32 / 2,
    rotation: Math.PI
  });
  window.belt25 = new Building('Belt I', {
    id: 25,
    x: 32 * 11 + 32 / 2,
    y: 32 * 3 + 32 / 2,
    rotation: Math.PI
  });
  window.belt26 = new Building('Belt I', {
    id: 26,
    x: 32 * 10 + 32 / 2,
    y: 32 * 3 + 32 / 2,
    rotation: Math.PI
  });

  window.belt.addItem('Copper');
  // belt4.addItem('Iron')

  // const item = new Item('Iron', {
  //   count: 1,
  // });
  // belt4.inventory[1] = item;
  // belt4.setItemPosition(item, 1)
  // belt5.addItem('Iron')
  // belt9.addItem('Iron')
  // belt17.addItem('Iron')
  // const item2 = new Item('Iron', {
  //   count: 1,
  // });
  // belt17.inventory[1] = item2;
  // belt17.setItemPosition(item2, 1)
  // belt18.addItem('Iron')
  // const item3 = new Item('Iron', {
  //   count: 1,
  // });
  // belt18.inventory[1] = item3;
  // belt18.setItemPosition(item3, 1)
}

main();

// window.spawnItem = (x, y) => {
//   const item = new Item('Iron', {
//     anchor: { x: 0.5, y: 0.5 },
//     x,
//     y,
//     width: GRID_SIZE / 2,
//     height: GRID_SIZE / 2,
//     color: 'purple',
//     render() {
//       const { context, color, width, height } = this;
//       context.fillStyle = color;
//       context.strokeStyle = 'white';
//       context.fillRect(2, 2, width-4, height-4);
//       context.strokeRect(2, 2, width-4, height-4);
//     }
//   });
//   _items.push(item);
//   return item;
// }

// window.item = spawnItem(200, 200);
