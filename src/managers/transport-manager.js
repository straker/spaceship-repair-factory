import grid from '../utils/grid.js';
import { removeFromArray } from '../utils/index.js';
import Building from '../building.js';

export const transportSegments = [];

/**
 * Manages adding and removing transport layer segments
 */
const transportManager = {
  /**
   * Add a transport segment
   * @param {Object} properties - Properties passed directly to the transport object constructor.
   */
  add(properties) {
    const item = grid.get(properties)[0];
    if (item) {
      return;
    }

    // TODO: replace with a reference to the constructor so other transport type objects can be created
    const belt = new Building('Belt I', properties);

    // get neighboring transports
    const { row, col, dir } = belt;
    const next = grid.getByType(
      {
        row: row + dir.row,
        col: col + dir.col
      },
      belt.type
    )[0];
    const prev = grid.getByType(
      {
        row: row - dir.row,
        col: col - dir.col
      },
      belt.type
    )[0];
    const side1 = grid.getByType(
      {
        row: row + dir.col,
        col: col + dir.row
      },
      belt.type
    )[0];
    const side2 = grid.getByType(
      {
        row: row - dir.col,
        col: col - dir.row
      },
      belt.type
    )[0];

    const prevSameDir = prev?.dir === dir;
    const nextSameDir = next?.dir === dir;

    // create doubly linked list
    if (next) {
      belt.next = next;

      if (nextSameDir) {
        next.prev = belt;
      }
    }
    if (prevSameDir) {
      belt.prev = prev;
      prev.next = belt;
    }
    if (
      side1 &&
      side1.row + side1.dir.row === row &&
      side1.col + side1.dir.col === col
    ) {
      side1.next = belt;
    }
    if (
      side2 &&
      side2.row + side2.dir.row === row &&
      side2.col + side2.dir.col === col
    ) {
      side2.next = belt;
    }

    // create segments
    if (!prev && !next) {
      belt.segment = { start: belt, end: belt };
      transportSegments.push(belt.segment);
    } else {
      // join segments if going the same direction
      if (prevSameDir) {
        belt.segment = prev.segment;
        belt.segment.end = belt;
      }
      // merge segments if going the same direction
      if (nextSameDir) {
        if (belt.segment) {
          const removeSegment = next.segment;

          belt.segment.end = next.segment.end;
          let b = next;
          while (b && b.segment === removeSegment) {
            b.segment = belt.segment;
            b = b.next;
          }

          removeFromArray(transportSegments, removeSegment);
        } else {
          belt.segment = next.segment;
          belt.segment.start = belt;
        }
      }

      // transports not going the same direction start a new segment
      if (!prevSameDir && !nextSameDir) {
        belt.segment = { start: belt, end: belt };
        transportSegments.push(belt.segment);
      }
    }

    return belt;
  },

  remove(belt) {
    // get neighboring transports
    const { row, col, dir, segment, prev, next } = belt;
    const side1 = grid.getByType(
      {
        row: row + dir.col,
        col: col + dir.row
      },
      belt.type
    )[0];
    const side2 = grid.getByType(
      {
        row: row - dir.col,
        col: col - dir.row
      },
      belt.type
    )[0];

    // only belt in the segment
    if (segment.start === belt && segment.start === segment.end) {
      removeFromArray(transportSegments, segment);
    }

    // split a belt segment in half
    if (prev?.segment === segment && next?.segment === segment) {
      const prevSegment = {
        start: segment.start,
        end: prev,
        updated: segment.updated
      };
      const nextSegment = {
        start: next,
        end: segment.end,
        updated: segment.updated
      };

      let b = prev;
      while (b && b.segment === segment) {
        b.segment = prevSegment;
        b = b.prev;
      }
      b = next;
      while (b && b.segment === segment) {
        b.segment = nextSegment;
        b = b.next;
      }

      // inject new segments into the place of the old one so
      // update / render order remains the same
      const index = removeFromArray(transportSegments, segment);
      if (index > -1) {
        transportSegments.splice(index, 0, ...[prevSegment, nextSegment]);
      }
    }

    if (prev?.segment === segment) {
      prev.segment.end = prev;
    }
    if (next?.segment === segment) {
      next.segment.start = next;
    }

    // remove belt references
    if (prev?.next === belt) {
      prev.next = null;
    }
    if (next?.prev === belt) {
      next.prev = null;
    }
    if (side1?.next === belt) {
      side1.next = null;
    }
    if (side2?.next === belt) {
      side2.next = null;
    }

    belt.prev = null;
    belt.next = null;
  },

  canPlace(cursor, items) {
    return !items.length;
  }
};

export default transportManager;
window.transportManager = transportManager;
window.transportSegments = transportSegments;
