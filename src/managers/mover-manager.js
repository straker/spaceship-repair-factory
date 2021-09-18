import { TYPES } from '../constants';
import grid from '../utils/grid';
import { on } from '../libs/kontra';
import componentManager, { moveComponent } from './component-manager';
import Mover from '../buildings/mover';
import { removeFromArray } from '../utils';

let movers = [];

let moverManager = {
  init() {
    on('gameTick', () => {
      movers.forEach(mover => {
        // movers move every 2 game ticks
        if (++mover.lastMove >= 2) {
          let fromRow = mover.row - mover.dir.row;
          let fromCol = mover.col - mover.dir.col;
          let toRow = mover.row + mover.dir.row;
          let toCol = mover.col + mover.dir.col;

          let from = grid
            .get({ row: fromRow, col: fromCol })
            .find(item => item.type !== TYPES.WALL);
          let to = grid
            .get({ row: toRow, col: toCol })
            .find(item => item.type !== TYPES.WALL);
          let component = from?.components?.[0] ?? from?.component;

          if (
            component &&
            !component.updated &&
            (mover.filter === component.name || mover.filter === 'NONE') &&
            to &&
            to.canTakeComponent(component)
          ) {
            mover.lastMove = 0;

            if (from.type === TYPES.BELT && to.type === TYPES.BELT) {
              moveComponent({ component, belt: to });
            } else if (to.type === TYPES.BELT) {
              componentManager.add({
                row: toRow,
                col: toCol,
                name: component.name
              });
            } else {
              if (to.addComponent) {
                to.addComponent(component);
              } else {
                to.component = component;
              }

              componentManager.remove(component);
            }

            if (from.components) {
              from.components.splice(from.components.indexOf(component), 1);
            } else {
              from.component = false;
            }

            mover.name = 'MOVER_END';
          }
        } else {
          mover.name = 'MOVER';
        }
      });
    });
  },

  add(properties) {
    let mover = new Mover(properties);
    movers.push(mover);
    return mover;
  },

  remove(mover) {
    removeFromArray(movers, mover);
  },

  // mover can only be placed on empty spots
  canPlace(cursor, items) {
    return !items.length;
  }
};

export default moverManager;
