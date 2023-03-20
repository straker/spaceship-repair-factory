import init from './init.js';
import { GameLoop, imageAssets, onInput } from './libs/kontra.js';
import grid from './utils/grid.js';
import { behaviorOrder, giveBehavior } from './behaviors/index.js';
import { GRID_SIZE, TYPES } from './constants.js';
import Building from './building.js';
import { buildings } from './data/buildings.js';
import { recipes } from './data/items.js';
import { _items } from './item.js';
import ImageButton from './ui/image-button.js';
import buildingPopup from './ui/building-popup.js';
import { toGrid, getDimensions } from './utils/index.js';

async function main() {
  const { canvas, context, pointer } = await init();

  // const imgBtn = new ImageButton({
  //   x: 100,
  //   y: 100,
  //   width: GRID_SIZE,
  //   height: GRID_SIZE,
  //   image: imageAssets['/src/assets/arm'],
  //   onDown() {}
  // });

  buildingPopup.init();
  window.cursor = new Building(null, {
    x: 0,
    y: 0,
    width: GRID_SIZE,
    height: GRID_SIZE,
    row: 0,
    col: 0,
    hidden: true,
    allowRotation: true,
  });

  GameLoop({
    // fps: 15,
    update(dt) {
      behaviorOrder.forEach(behavior => behavior.run(dt));
      grid.update();
      _items.forEach(item => item.update());
      buildingPopup.update();

      cursor.row = toGrid(pointer.y);
      cursor.col = toGrid(pointer.x);
      cursor.x = cursor.col * GRID_SIZE;
      cursor.y = cursor.row * GRID_SIZE;
    },
    render() {
      grid.render();
      _items.forEach(item => item.render());
      // imgBtn.render();
      buildingPopup.render();

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

      if (!cursor.hidden) {
        cursor.render();
      }
    }
  }).start();

  function setCursor(name) {
    cursor.hidden = false;
    cursor.image = null
    cursor.animations = null;
    cursor.buildingName = name;

    if (!name) {
      cursor.hidden = true;
      return;
    }

    const building = buildings[name];
    if (building.image) {
      cursor.image = building.image;
      cursor.width = building.image.width;
      cursor.height = building.image.height;
      return;
    }

    if (building.animations.cursor) {
      cursor.animations = building.animations;
      cursor.playAnimation('cursor');
      cursor.width = cursor.currentAnimation.width;
      cursor.height = cursor.currentAnimation.height;
    }
  }

  onInput(['1'], () => {
    // dont rotate the belt cursor but instead show the
    // appropriate animation rotation (how?)
    setCursor('Belt I');
  });
  onInput(['2'], () => {
    setCursor('Arm');
  });
  onInput(['3'], () => {
    setCursor('Power I');
  });
  onInput(['4'], () => {
    setCursor('Extractor I');
  });
  onInput(['5'], () => {
    setCursor('Assembler I');
  });
  onInput(['6'], () => {
    setCursor('Storage');
  });
  onInput(['7'], () => {
    setCursor('Furnace I');
  });
  onInput('esc', () => {
    setCursor(null);
  });
  onInput('r', () => {
    cursor.facing = (cursor.facing + Math.PI / 2) % (Math.PI * 2);
  }, { key: { preventDefault: false }});

  onInput('down', () => {

    // select building
    if (!cursor.buildingName) {
      const building = grid.getByType(cursor, TYPES.building)[0];
      if (building?.setRecipe) {
        buildingPopup.show(building);
        return;
      }
    }

    // place building
    const { startRow, startCol, endRow, endCol } = getDimensions(cursor);
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (grid.getByType({ row, col }, TYPES.building)[0]) {
          return;
        }
      }
    }

    new Building(cursor.buildingName, {
      row: cursor.row,
      col: cursor.col,
      rotation: cursor.facing
    });
  });

  // window.DEBUG = true
  window.blds = [];
  window.extractor = new Building('Extractor I', {
    id: 1,
    col: 6,
    row: 4,
    // rotation: Math.PI*3/2
  });
  const length = 30;
  for (let i = 0; i < length; i++) {
    // blds.push(new Building('Belt I', {
    //   id: i,
    //   col: 5+i,
    //   row: 6,
    //   rotation: 0
    // }));
    // blds.push(new Building('Belt I', {
    //   id: i+length,
    //   col: 5,
    //   row: 3+i,
    //   rotation: Math.PI/2
    // }));
    // blds.push(new Building('Belt I', {
    //   id: i+length*2,
    //   col: 6+i,
    //   row: 3,
    //   rotation: Math.PI
    // }));
    // blds.push(new Building('Belt I', {
    //   id: i+length*3,
    //   col: 8,
    //   row: 4+i,
    //   rotation: Math.PI*3/2
    // }));
  }

  window.power = new Building('Power I', {
    row: 9,
    col: 10
  });
  // window.power2 = new Building('Power I', {
  //   row: 4,
  //   col: 12
  // });

  window.assembler = new Building('Assembler I', {
    row: 14,
    col: 14
  });
  // window.arm = new Building('Arm', {
  //   col: 6+length,
  //   row: 4
  // });
  // window.assembler = new Building('Assembler I', {
  //   col: 6+length+1,
  //   row: 4
  // });
  // assembler.recipe = recipes.Wire;
  // window.arm2 = new Building('Arm', {
  //   col: 6+length+4,
  //   row: 4
  // });

  // window.belt = buildings[0];
  // belt.addItem('Nickel');
  // setInterval(() => belt.addItem('Nickel'), 500);
  // giveBehavior('spawnItem', buildings[0], { item: 'Nickel', amount: 1, rate: 1 })

  // setTimeout(() => { debugger }, 2000);

  // window.DEBUG=true
  // window.belt = new Building('Belt I', {
  //   id: 1,
  //   col: 6,
  //   row: 4
  // });
  // window.belt2 = new Building('Belt I', {
  //   id: 2,
  //   col: 7,
  //   row: 4
  // });
  // window.belt3 = new Building('Belt I', {
  //   id: 3,
  //   col: 8,
  //   row: 4
  // });
  // window.belt4 = new Building('Belt I', {
  //   id: 4,
  //   col: 9,
  //   row: 1,
  //   rotation: Math.PI / 2
  // });
  // window.belt5 = new Building('Belt I', {
  //   id: 5,
  //   col: 9,
  //   row: 2,
  //   rotation: Math.PI / 2
  // });
  // window.belt6 = new Building('Belt I', {
  //   id: 6,
  //   col: 9,
  //   row: 3,
  //   rotation: Math.PI / 2
  // });
  // window.belt7 = new Building('Belt I', {
  //   id: 7,
  //   col: 9,
  //   row: 4,
  //   rotation: Math.PI / 2
  // });
  // window.belt8 = new Building('Belt I', {
  //   id: 8,
  //   col: 9,
  //   row: 5,
  //   rotation: Math.PI / 2
  // });
  // window.belt9 = new Building('Belt I', {
  //   id: 9,
  //   col: 9,
  //   row: 0,
  //   rotation: Math.PI / 2
  // });
  // window.belt18 = new Building('Belt I', {
  //   id: 18,
  //   col: 5,
  //   row: 6
  // });
  // window.belt17 = new Building('Belt I', {
  //   id: 17,
  //   col: 6,
  //   row: 6
  // });
  // window.belt10 = new Building('Belt I', {
  //   id: 10,
  //   col: 7,
  //   row: 6
  // });
  // window.belt11 = new Building('Belt I', {
  //   id: 11,
  //   col: 8,
  //   row: 6
  // });
  // window.belt12 = new Building('Belt I', {
  //   id: 12,
  //   col: 9,
  //   row: 6
  // });
  // window.belt13 = new Building('Belt I', {
  //   id: 13,
  //   col: 10,
  //   row: 6
  // });
  // window.belt14 = new Building('Belt I', {
  //   id: 14,
  //   col: 11,
  //   row: 6
  // });
  // window.belt15 = new Building('Belt I', {
  //   id: 15,
  //   col: 12,
  //   row: 6
  // });
  // window.belt16 = new Building('Belt I', {
  //   id: 16,
  //   col: 13,
  //   row: 6
  // });
  // window.belt19 = new Building('Belt I', {
  //   id: 19,
  //   col: 14,
  //   row: 6,
  //   rotation: (Math.PI * 3) / 2
  // });
  // window.belt20 = new Building('Belt I', {
  //   id: 20,
  //   col: 14,
  //   row: 5,
  //   rotation: (Math.PI * 3) / 2
  // });
  // window.belt21 = new Building('Belt I', {
  //   id: 21,
  //   col: 14,
  //   row: 4,
  //   rotation: (Math.PI * 3) / 2
  // });
  // window.belt22 = new Building('Belt I', {
  //   id: 22,
  //   col: 14,
  //   row: 3,
  //   rotation: Math.PI
  // });
  // window.belt23 = new Building('Belt I', {
  //   id: 23,
  //   col: 13,
  //   row: 3,
  //   rotation: Math.PI
  // });
  // window.belt24 = new Building('Belt I', {
  //   id: 24,
  //   col: 12,
  //   row: 3,
  //   rotation: Math.PI
  // });
  // window.belt25 = new Building('Belt I', {
  //   id: 25,
  //   col: 11,
  //   row: 3,
  //   rotation: Math.PI
  // });
  // window.belt26 = new Building('Belt I', {
  //   id: 26,
  //   col: 10,
  //   row: 3,
  //   rotation: Math.PI
  // });

  // // window.belt.addItem('Copper');
  // // belt4.addItem('Iron')

  // // const item = new Item('Iron', {
  // //   count: 1,
  // // });
  // // belt4.inventory[1] = item;
  // // belt4.setItemPosition(item, 1)
  // // belt5.addItem('Iron')
  // // belt9.addItem('Iron')
  // // belt17.addItem('Iron')
  // // const item2 = new Item('Iron', {
  // //   count: 1,
  // // });
  // // belt17.inventory[1] = item2;
  // // belt17.setItemPosition(item2, 1)
  // // belt18.addItem('Iron')
  // // const item3 = new Item('Iron', {
  // //   count: 1,
  // // });
  // // belt18.inventory[1] = item3;
  // // belt18.setItemPosition(item3, 1)
  // // behaviors.spawnItem.add(belt18, {
  // //   item: 'Iron',
  // //   amount: 1,
  // //   rate: 2
  // // });

  // window.arm = new Building('Arm', {
  //   col: 4,
  //   row: 6
  // });
  // window.storage = new Building('Storage', {
  //   col: 3,
  //   row: 6
  // });
  // window.arm2 = new Building('Arm', {
  //   col: 15,
  //   row: 6
  // });
  // window.assembler = new Building('Assembler I', {
  //   col: 16,
  //   row: 6
  // });
  // assembler.recipe = recipes.Wire;
  // window.arm3 = new Building('Arm', {
  //   col: 19,
  //   row: 6
  // });
  // for (let i = 6; i < canvas.height / GRID_SIZE | 0; i++) {
  //   const id = i + 21;
  //   window['belt' + id] = new Building('Belt I', {
  //     id,
  //     col: 20,
  //     row: i,
  //     rotation: Math.PI/2
  //   });
  // }

  //  window.arm3 = new Building('Arm', {
  //   col: 5,
  //   row: 5,
  //   rotation: Math.PI/2
  // });
  //  window.storage2 = new Building('Storage', {
  //   col: 5,
  //   row: 4
  // });

   // buildingPopup.init();
   // buildingPopup.show(assembler);
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