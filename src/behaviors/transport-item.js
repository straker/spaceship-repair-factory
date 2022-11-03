import Behavior from './behavior.js';
import grid from '../utils/grid.js';
import { removeFromArray } from '../utils/index.js';
import { TYPES } from '../constants.js';

// expose for testing
export const _transportSegments = [];

class TransportItemBehavior extends Behavior {
  constructor() {
    super('transportItem');
  }

  /**
   * Allows a building to move an item to the next in line.
   * @param {Building} building - Building the behavior applies to.
   * @param {Object} options - Behavior options.
   * @param {Number} options.rate - How often (in seconds) to move the item.
   */
  add(building, options = {}) {
    super.add(building, options);
    building.type += TYPES.transport;
    addTransport(building);
  }

  _remove(building, behavior) {
    super._remove(building, behavior);
    removeTransport(building);
  }

  _behavior(building, dt) {
    console.log(building, dt);
  }
}

const transportItemBehavior = new TransportItemBehavior();
export default transportItemBehavior;

/**
 * Add a building to an existing transport segment or create a new one.
 * @param {Building} building - Building to add.
 */
function addTransport(building) {
  // get neighboring transports
  const { row, col, dir } = building;
  const next = grid.getByType(
    {
      row: row + dir.row,
      col: col + dir.col
    },
    TYPES.transport
  )[0];
  const prev = grid.getByType(
    {
      row: row - dir.row,
      col: col - dir.col
    },
    TYPES.transport
  )[0];
  const side1 = grid.getByType(
    {
      row: row + dir.col,
      col: col + dir.row
    },
    TYPES.transport
  )[0];
  const side2 = grid.getByType(
    {
      row: row - dir.col,
      col: col - dir.row
    },
    TYPES.transport
  )[0];

  const prevSameDir = prev?.dir === dir;
  const nextSameDir = next?.dir === dir;

  // create doubly linked list
  if (next) {
    building.next = next;

    if (nextSameDir) {
      next.prev = building;
    }
  }
  if (prevSameDir) {
    building.prev = prev;
    prev.next = building;
  }
  if (
    side1 &&
    side1.row + side1.dir.row === row &&
    side1.col + side1.dir.col === col
  ) {
    side1.next = building;
  }
  if (
    side2 &&
    side2.row + side2.dir.row === row &&
    side2.col + side2.dir.col === col
  ) {
    side2.next = building;
  }

  // create segments
  if (!prev && !next) {
    building.segment = { start: building, end: building };
    _transportSegments.push(building.segment);
  } else {
    // join segments if going the same direction
    if (prevSameDir) {
      building.segment = prev.segment;
      building.segment.end = building;
    }
    // merge segments if going the same direction
    if (nextSameDir) {
      if (building.segment) {
        const removeSegment = next.segment;

        building.segment.end = next.segment.end;
        let b = next;
        while (b && b.segment === removeSegment) {
          b.segment = building.segment;
          b = b.next;
        }

        removeFromArray(_transportSegments, removeSegment);
      } else {
        building.segment = next.segment;
        building.segment.start = building;
      }
    }

    // transports not going the same direction start a new segment
    if (!prevSameDir && !nextSameDir) {
      building.segment = { start: building, end: building };
      _transportSegments.push(building.segment);
    }
  }
}

/**
 * Remove a building from a transport segment.
 * @param {Building} building - Building to remove.
 */
function removeTransport(building) {
  // get neighboring transports
  const { row, col, dir, segment, prev, next } = building;

  if (!segment) {
    return;
  }

  const side1 = grid.getByType(
    {
      row: row + dir.col,
      col: col + dir.row
    },
    TYPES.transport
  )[0];
  const side2 = grid.getByType(
    {
      row: row - dir.col,
      col: col - dir.row
    },
    TYPES.transport
  )[0];

  // only building in the segment
  if (segment.start === segment.end) {
    removeFromArray(_transportSegments, segment);
  }

  // split a building segment in half
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
    const index = removeFromArray(_transportSegments, segment);
    if (index > -1) {
      _transportSegments.splice(index, 0, ...[prevSegment, nextSegment]);
    }
  }

  if (prev?.segment === segment) {
    prev.segment.end = prev;
  }
  if (next?.segment === segment) {
    next.segment.start = next;
  }

  // remove building references
  if (prev?.next === building) {
    prev.next = null;
  }
  if (next?.prev === building) {
    next.prev = null;
  }
  if (side1?.next === building) {
    side1.next = null;
  }
  if (side2?.next === building) {
    side2.next = null;
  }

  building.prev = null;
  building.next = null;
  building.segment = null;
}
