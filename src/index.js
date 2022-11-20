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
      behaviors.spawnItem.run(dt);
      behaviors.takeItem.run(dt);
      behaviors.putItem.run(dt);
      behaviors.craftItem.run(dt);
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
    col: 6,
    row: 4
  });
  window.belt2 = new Building('Belt I', {
    id: 2,
    col: 7,
    row: 4
  });
  window.belt3 = new Building('Belt I', {
    id: 3,
    col: 8,
    row: 4
  });
  window.belt4 = new Building('Belt I', {
    id: 4,
    col: 9,
    row: 1,
    rotation: Math.PI / 2
  });
  window.belt5 = new Building('Belt I', {
    id: 5,
    col: 9,
    row: 2,
    rotation: Math.PI / 2
  });
  window.belt6 = new Building('Belt I', {
    id: 6,
    col: 9,
    row: 3,
    rotation: Math.PI / 2
  });
  window.belt7 = new Building('Belt I', {
    id: 7,
    col: 9,
    row: 4,
    rotation: Math.PI / 2
  });
  window.belt8 = new Building('Belt I', {
    id: 8,
    col: 9,
    row: 5,
    rotation: Math.PI / 2
  });
  window.belt9 = new Building('Belt I', {
    id: 9,
    col: 9,
    row: 0,
    rotation: Math.PI / 2
  });
  window.belt18 = new Building('Belt I', {
    id: 18,
    col: 5,
    row: 6
  });
  window.belt17 = new Building('Belt I', {
    id: 17,
    col: 6,
    row: 6
  });
  window.belt10 = new Building('Belt I', {
    id: 10,
    col: 7,
    row: 6
  });
  window.belt11 = new Building('Belt I', {
    id: 11,
    col: 8,
    row: 6
  });
  window.belt12 = new Building('Belt I', {
    id: 12,
    col: 9,
    row: 6
  });
  window.belt13 = new Building('Belt I', {
    id: 13,
    col: 10,
    row: 6
  });
  window.belt14 = new Building('Belt I', {
    id: 14,
    col: 11,
    row: 6
  });
  window.belt15 = new Building('Belt I', {
    id: 15,
    col: 12,
    row: 6
  });
  window.belt16 = new Building('Belt I', {
    id: 16,
    col: 13,
    row: 6
  });
  window.belt19 = new Building('Belt I', {
    id: 19,
    col: 14,
    row: 6,
    rotation: (Math.PI * 3) / 2
  });
  window.belt20 = new Building('Belt I', {
    id: 20,
    col: 14,
    row: 5,
    rotation: (Math.PI * 3) / 2
  });
  window.belt21 = new Building('Belt I', {
    id: 21,
    col: 14,
    row: 4,
    rotation: (Math.PI * 3) / 2
  });
  window.belt22 = new Building('Belt I', {
    id: 22,
    col: 14,
    row: 3,
    rotation: Math.PI
  });
  window.belt23 = new Building('Belt I', {
    id: 23,
    col: 13,
    row: 3,
    rotation: Math.PI
  });
  window.belt24 = new Building('Belt I', {
    id: 24,
    col: 12,
    row: 3,
    rotation: Math.PI
  });
  window.belt25 = new Building('Belt I', {
    id: 25,
    col: 11,
    row: 3,
    rotation: Math.PI
  });
  window.belt26 = new Building('Belt I', {
    id: 26,
    col: 10,
    row: 3,
    rotation: Math.PI
  });

  // window.belt.addItem('Copper');
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
  // behaviors.spawnItem.add(belt18, {
  //   item: 'Iron',
  //   amount: 1,
  //   rate: 2
  // });

  window.arm = new Building('Arm', {
    col: 4,
    row: 6
  });
  window.storage = new Building('Storage', {
    col: 3,
    row: 6
  });
  window.arm2 = new Building('Arm', {
    col: 15,
    row: 6
  });
  window.assembler = new Building('Assembler I', {
    col: 16,
    row: 6
  });
  assembler.recipe = recipes.Wire;
  window.arm3 = new Building('Arm', {
    col: 19,
    row: 6
  });
  for (let i = 6; i < canvas.height / GRID_SIZE | 0; i++) {
    const id = i + 21;
    window['belt' + id] = new Building('Belt I', {
      id,
      col: 20,
      row: i,
      rotation: Math.PI/2
    });
  }
}

main();

// window.spawnItem = (x, y) => {
//   const item = new Item('Iron', {
//     anchor: { col: 0.5, row: 0.5 },
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

// storage = new Building('Storage', { col: 32*4, row: 32*4 });
// arm = new Building('Arm', { col: 32*5, row: 32*4 });
// belt = new Building('Belt I', { col: 32*6, row: 32*4 });
// belt2 = new Building('Belt I', { col: 32*7, row: 32*4 });
// belt3 = new Building('Belt I', { col: 32*8, row: 32*4 });
// assembler = new Building('Assembler I', { col: 32*8, row: 32*4 });
window.grid = grid;