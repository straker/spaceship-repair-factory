import { TYPES, DIRS } from '../constants';
import grid from '../utils/grid';
import { rotate, removeFromArray } from '../utils';
import Belt from '../buildings/belt';
import ExportBelt from '../buildings/export-belt';
import ImportBelt from '../buildings/import-belt';

export let beltSegments = [];

let beltManager = {
  init() {},

  add(properties) {
    // auto place import / export belt from a belt
    let item = grid.get(properties)[0];
    let belt;

    if (!item) {
      belt = new Belt(properties);
    }
    // import / export belt
    else {
      // import belt goes same direction as well
      if (properties.dir === item.dir) {
        belt = new ExportBelt(properties);
      } else {
        belt = new ImportBelt(properties);
      }
    }

    // get neighboring belts
    let { row, col, dir } = belt;
    let nextBelt = grid.getByType(
      {
        row: row + dir.row,
        col: col + dir.col
      },
      TYPES.BELT
    )[0];
    let prevBelt = grid.getByType(
      {
        row: row - dir.row,
        col: col - dir.col
      },
      TYPES.BELT
    )[0];
    let sideBelt1 = grid.getByType(
      {
        row: row + dir.col,
        col: col + dir.row
      },
      TYPES.BELT
    )[0];
    let sideBelt2 = grid.getByType(
      {
        row: row - dir.col,
        col: col - dir.row
      },
      TYPES.BELT
    )[0];

    let prevSameDir = prevBelt?.dir === dir;
    let nextSameDir = nextBelt?.dir === dir;

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
          let removeSegment = nextBelt.segment;

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

    return belt;
  },

  remove(belt) {
    // get neighboring belts
    let { row, col, dir, segment, prevBelt, nextBelt } = belt;
    let sideBelt1 = grid.getByType(
      {
        row: row + dir.col,
        col: col + dir.row
      },
      TYPES.BELT
    )[0];
    let sideBelt2 = grid.getByType(
      {
        row: row - dir.col,
        col: col - dir.row
      },
      TYPES.BELT
    )[0];

    // only belt in the segment
    if (segment.start === belt && segment.start === segment.end) {
      removeFromArray(beltSegments, segment);
    }

    // split a belt segment in half
    if (prevBelt?.segment === segment && nextBelt?.segment === segment) {
      let prevSegment = {
        start: segment.start,
        end: prevBelt,
        updated: segment.updated
      };
      let nextSegment = {
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
      let index = removeFromArray(beltSegments, segment);
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
  },

  canPlace(cursor, items) {
    // belts can only be placed on empty spots but import / export
    // belts can be placed on walls that match their dir
    return (
      !items.length ||
      (items.length &&
        items.every(
          item =>
            item.type === TYPES.WALL &&
            item.dir &&
            cursor.dir &&
            (item.dir === cursor.dir || item.dir === DIRS[rotate(cursor, 180)])
        ))
    );
  }
};

export default beltManager;
