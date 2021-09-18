import { on } from '../libs/kontra';
import { beltSegments } from './belt-manager';
import { easeLinear, removeFromArray } from '../utils';
import grid from '../utils/grid';
import { TICK_DURATION, TYPES } from '../constants';
import Component from '../components/component';
import componentStroage from '../components/storage';

let components = [];
let moveComponents = [];

let timer = 0;
on('update', () => {
  timer = (timer + 1 / 60) % TICK_DURATION;
  moveComponents.forEach(({ x, y, component, belt }) => {
    component.x = easeLinear(timer, x, belt.x - x, TICK_DURATION);
    component.y = easeLinear(timer, y, belt.y - y, TICK_DURATION);

    if (['EXIT', 'SHIP'].includes(belt.name)) {
      component.opacity = easeLinear(timer, 1, -1, TICK_DURATION);
    } else if (component.opacity < 1) {
      component.opacity = easeLinear(timer, 0, 1, TICK_DURATION);
    }
  });
});

export function moveComponent({ component, belt }) {
  belt.component = component;
  component.updated = true;

  moveComponents.push({
    x: component.x,
    y: component.y,
    component,
    belt
  });
}

// belt segments and update pattern inspired from https://www.youtube.com/watch?v=88cIVR4KI_Q
let componentManager = {
  init() {
    on('preGameTick', () => {
      timer = 0;
      components.forEach(component => (component.updated = false));
      beltSegments.forEach(beltSegments => (beltSegments.updated = false));
      moveComponents.forEach(({ component, belt }) => {
        component.x = belt.x;
        component.y = belt.y;

        if (component.opacity !== 1) {
          component.opacity = 1;
        }

        if (belt.name === 'EXIT') {
          componentStroage.add(component);
          components.splice(components.indexOf(component), 1);
        } else if (belt.name === 'SHIP') {
          components.splice(components.indexOf(component), 1);
        }
      });
      moveComponents.length = 0;
    });

    on('gameTick', () => {
      beltSegments.forEach(currSegment => {
        let removed;

        // update each segment in closest to the end of the segment
        // chain order so we can move the components in the same
        // order (so a component at the end of the chain moves before
        // a component at the start of the chain)
        let segment;
        do {
          segment = currSegment;
          if (segment.updated) return;

          let visitedSegments = [segment];
          while (
            !visitedSegments.includes(segment.end.nextBelt?.segment) &&
            segment.end.nextBelt?.segment?.updated === false
          ) {
            segment = segment.end.nextBelt.segment;
            visitedSegments.push(segment);
          }

          // special case: if the segment chain loops on itself, then
          // we need to determine if the entire component chain has
          // room to move. if it does then we remove the last component
          // and update all components, then place the last component
          // back into the correct spot
          if (
            visitedSegments.includes(segment.end.nextBelt?.segment) &&
            segment.end.component &&
            segment.end.nextBelt.component
          ) {
            let startBelt = segment.end.nextBelt;
            let belt = startBelt.nextBelt;
            let emptyBelt = false;
            while (belt !== startBelt) {
              if (!belt.component) {
                emptyBelt = true;
                break;
              }

              belt = belt.nextBelt;
            }

            if (emptyBelt) {
              removed = {
                component: startBelt.component,
                belt: startBelt.nextBelt
              };
              startBelt.component = null;
            }
          }

          let belt = segment.end;
          while (belt) {
            let { component, nextBelt } = belt;

            if (
              component &&
              !component.updated &&
              nextBelt &&
              !nextBelt.component
            ) {
              belt.component = null;
              moveComponent({ component, belt: nextBelt });
            }

            if (belt.name === 'IMPORT' && !belt.component) {
              let comp = componentStroage.get(belt.filter);
              if (comp) {
                component = this.add(
                  {
                    row: belt.row - belt.dir.row,
                    col: belt.col - belt.dir.col,
                    opacity: 0,
                    ...comp
                  },
                  belt.prevBelt
                );
                moveComponent({ component, belt });
              }
            }

            if (belt === segment.start) {
              break;
            }

            belt = belt.prevBelt;
          }

          segment.updated = true;
        } while (segment !== currSegment);

        // place the special case removed component onto the
        // next belt it should have moved to
        if (removed) {
          moveComponent(removed);
        }
      });
    });
  },

  add(properties, belt) {
    let { row, col } = properties;
    belt = belt ?? grid.getByType({ row, col }, TYPES.BELT)[0];
    let component = new Component(properties);
    belt.component = component;

    components.push(component);
    return component;
  },

  remove(component) {
    removeFromArray(components, component);
  },

  render() {
    components.forEach(component => component.render());
  }
};

export default componentManager;
