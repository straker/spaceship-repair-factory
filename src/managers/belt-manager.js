import { TYPES } from '../constants.js';
import grid from '../utils/grid.js';
import { removeFromArray } from '../utils/index.js';
import Belt from '../buildings/belt.js';

export const beltSegments = [];

const beltManager = {
  init() {},

  add(properties) {
    const item = grid.get(properties)[0];
    if (item) {
      return;
    }

    const belt = new Belt(properties);

    // get neighboring belts
    const { row, col, dir } = belt;
    const nextBelt = grid.getByType(
      {
        row: row + dir.row,
        col: col + dir.col
      },
      TYPES.belt
    )[0];
    const prevBelt = grid.getByType(
      {
        row: row - dir.row,
        col: col - dir.col
      },
      TYPES.belt
    )[0];
    const sideBelt1 = grid.getByType(
      {
        row: row + dir.col,
        col: col + dir.row
      },
      TYPES.belt
    )[0];
    const sideBelt2 = grid.getByType(
      {
        row: row - dir.col,
        col: col - dir.row
      },
      TYPES.belt
    )[0];

    const prevSameDir = prevBelt?.dir === dir;
    const nextSameDir = nextBelt?.dir === dir;

    // create doubly linked list
    if (nextBelt) {
      belt.nextBelt = nextBelt;

      if (nextSameDir) {
        nextBelt.prevBelt = belt;
      }
    }
    if (prevSameDir) {
      belt.prevBelt = prevBelt;
      prevBelt.nextBelt = belt;
    }
    if (
      sideBelt1 &&
      sideBelt1.row + sideBelt1.dir.row === row &&
      sideBelt1.col + sideBelt1.dir.col === col
    ) {
      sideBelt1.nextBelt = belt;
    }
    if (
      sideBelt2 &&
      sideBelt2.row + sideBelt2.dir.row === row &&
      sideBelt2.col + sideBelt2.dir.col === col
    ) {
      sideBelt2.nextBelt = belt;
    }

    // create segments
    if (!prevBelt && !nextBelt) {
      belt.segment = { start: belt, end: belt };
      beltSegments.push(belt.segment);
    } else {
      // join segments if going the same direction
      if (prevSameDir) {
        belt.segment = prevBelt.segment;
        belt.segment.end = belt;
      }
      // merge segments if going the same direction
      if (nextSameDir) {
        if (belt.segment) {
          const removeSegment = nextBelt.segment;

          belt.segment.end = nextBelt.segment.end;
          let b = nextBelt;
          while (b && b.segment === removeSegment) {
            b.segment = belt.segment;
            b = b.nextBelt;
          }

          removeFromArray(beltSegments, removeSegment);
        } else {
          belt.segment = nextBelt.segment;
          belt.segment.start = belt;
        }
      }

      // belts not going the same direction start a new segment
      if (!prevSameDir && !nextSameDir) {
        belt.segment = { start: belt, end: belt };
        beltSegments.push(belt.segment);
      }
    }

    grid.add(belt);
    return belt;
  },

  remove(belt) {
    // get neighboring belts
    const { row, col, dir, segment, prevBelt, nextBelt } = belt;
    const sideBelt1 = grid.getByType(
      {
        row: row + dir.col,
        col: col + dir.row
      },
      TYPES.belt
    )[0];
    const sideBelt2 = grid.getByType(
      {
        row: row - dir.col,
        col: col - dir.row
      },
      TYPES.belt
    )[0];

    // only belt in the segment
    if (segment.start === belt && segment.start === segment.end) {
      removeFromArray(beltSegments, segment);
    }

    // split a belt segment in half
    if (prevBelt?.segment === segment && nextBelt?.segment === segment) {
      const prevSegment = {
        start: segment.start,
        end: prevBelt,
        updated: segment.updated
      };
      const nextSegment = {
        start: nextBelt,
        end: segment.end,
        updated: segment.updated
      };

      let b = prevBelt;
      while (b && b.segment === segment) {
        b.segment = prevSegment;
        b = b.prevBelt;
      }
      b = nextBelt;
      while (b && b.segment === segment) {
        b.segment = nextSegment;
        b = b.nextBelt;
      }

      // inject new segments into the place of the old one so
      // update / render order remains the same
      const index = removeFromArray(beltSegments, segment);
      if (index > -1) {
        beltSegments.splice(index, 0, ...[prevSegment, nextSegment]);
      }
    }

    if (prevBelt?.segment === segment) {
      prevBelt.segment.end = prevBelt;
    }
    if (nextBelt?.segment === segment) {
      nextBelt.segment.start = nextBelt;
    }

    // remove belt references
    if (prevBelt?.nextBelt === belt) {
      prevBelt.nextBelt = null;
    }
    if (nextBelt?.prevBelt === belt) {
      nextBelt.prevBelt = null;
    }
    if (sideBelt1?.nextBelt === belt) {
      sideBelt1.nextBelt = null;
    }
    if (sideBelt2?.nextBelt === belt) {
      sideBelt2.nextBelt = null;
    }

    belt.prevBelt = null;
    belt.nextBelt = null;
    grid.remove(belt);
  },

  canPlace(cursor, items) {
    return !items.length;
  }
};

export default beltManager;
window.beltManager = beltManager;
