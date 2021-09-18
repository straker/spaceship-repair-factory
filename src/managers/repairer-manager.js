import { TYPES, GRID_SIZE } from '../constants';
import grid from '../utils/grid';
import { on } from '../libs/kontra';
import { moveComponent } from './component-manager';
import Repairer from '../buildings/repairer';
import { removeFromArray } from '../utils';

let repairers = [];

let repairerManager = {
  init() {
    on('gameTick', () => {
      repairers.forEach(repairer => {
        // repairers move every 2 game ticks
        if (++repairer.lastMove >= 2) {
          let fromRow = repairer.row - repairer.dir.row;
          let fromCol = repairer.col - repairer.dir.col;
          let toRow = repairer.row + repairer.dir.row;
          let toCol = repairer.col + repairer.dir.col;

          let from = grid
            .get({ row: fromRow, col: fromCol })
            .find(item => item.type !== TYPES.WALL);
          let component = from?.components?.[0] ?? from?.component;
          let ship = grid
            .get({ row: 26, col: 8 })
            .filter(item => item.type === TYPES.SHIP)[0];

          if (component && ship?.canTakeComponent(component)) {
            repairer.lastMove = 0;
            ship.addComponent(component);

            moveComponent({
              component,
              belt: { x: toCol * GRID_SIZE, y: toRow * GRID_SIZE, name: 'SHIP' }
            });
            from.component = false;
            repairer.name = 'REPAIRER_END';
          }
        } else {
          repairer.name = 'REPAIRER';
        }
      });
    });
  },

  add(properties) {
    let repairer = new Repairer(properties);
    repairers.push(repairer);
    return repairer;
  },

  remove(repairer) {
    removeFromArray(repairers, repairer);
  },

  // repairer can only be placed on empty spots next to the ship
  canPlace(cursor, items) {
    return (
      items.length === 1 &&
      [29, 30, 39, 40].includes(items[0].tile) &&
      cursor.dir === items[0].dir
    );
  }
};

export default repairerManager;
