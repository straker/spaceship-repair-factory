import { collides } from '../libs/kontra.js';
import Behavior from './behavior.js';
import grid from '../utils/grid.js';
import { deepCopy, removeFromArray } from '../utils/index.js';
import { TYPES, GRID_SIZE, ITEM_SIZE } from '../constants.js';
import Item from '../item.js';

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
   * @param {Number} options.speed - How fast (in tiles per second) the transport moves the item.
   */
  add(building, options = {}) {
    Object.assign(building, deepCopy(transportProperties));

    building.type += TYPES.transport;
    building.maxStackSize = 1;
    building.inventorySlots = (building.width / ITEM_SIZE) | 0;

    super.add(building, options);
    addTransport(building);
  }

  _remove(building, behavior) {
    super._remove(building, behavior);
    removeTransport(building);
  }

  // the behavior runs on the entire group and not per building
  run(dt) {
    _transportSegments.forEach(segment => {
      segment.updated = false;
    });

    _transportSegments.forEach(curSegment => {
      if (curSegment.updated) {
        return;
      }

      // update each segment from end to start order
      let segment = curSegment;
      const visited = [curSegment];
      while (segment.end.next && !segment.end.next.segment.updated) {
        segment = segment.end.next.segment;

        // already visited this segment
        if (visited.includes(segment)) {
          break;
        }

        visited.push(segment);
      }

      while (visited.length) {
        segment = visited.pop();
        segment.updated = true;
        let building = segment.end;

        while (building?.segment === segment) {
          // update items in FIFO order
          for (let i = building.inventorySlots - 1; i >= 0; i--) {
            const item = building.inventory[i];

            if (!item) {
              continue;
            }

            const { speed } = building.behaviors.transportItem[0];
            const distance = GRID_SIZE * speed * dt;
            const x = item.x + building.dir.col * distance;
            const y = item.y + building.dir.row * distance;
            const nextPos = {
              x,
              y,
              width: item.width,
              height: item.height,
              anchor: item.anchor
            };
            const nextSlot = building.getInventorySlot(nextPos);

            // move item to next building
            if (nextSlot >= building.inventorySlots) {
              if (!building.next) {
                building.setItemPosition(item, i);
                continue;
              }

              // perpendicular transport direction
              if (building.dir !== building.next.dir) {
                // the item will be placed into slot 0 of the
                // building but will immediately move and
                // enter the next slot, so we need to look
                // at both of them
                const [firstItem, secondItem] = building.next.inventory;

                // allow the item to fit into a smaller hole
                // in the belt density
                building.next.setItemPosition(nextPos, 0);
                nextPos.width -= item.margin;
                nextPos.height -= item.margin;

                if (
                  (secondItem && firstItem) ||
                  (secondItem && collides(nextPos, secondItem))
                ) {
                  building.setItemPosition(item, i);
                  continue;
                }

                building.next.setItemPosition(item, 0);
                building.inventory[i] = undefined;

                if (!secondItem) {
                  item.x += building.next.dir.col * distance;
                  item.y += building.next.dir.row * distance;

                  building.next.inventory[1] = item;
                } else {
                  building.next.inventory[0] = item;
                }

                continue;
              }

              // same dir transport building
              const nextItem = building.next.inventory[0];
              if (nextItem) {
                building.setItemPosition(item, i);
                continue;
              }

              item.x = nextPos.x;
              item.y = nextPos.y;

              building.inventory[i] = undefined;
              building.next.inventory[0] = item;
              continue;
            }

            // move item to next slot in the same building
            if (nextSlot !== i) {
              const nextItem = building.inventory[nextSlot];
              building.setItemPosition(item, i);

              if (nextItem && collides(nextPos, nextItem)) {
                continue;
              }

              item.x = nextPos.x;
              item.y = nextPos.y;

              building.inventory[i] = undefined;
              building.inventory[nextSlot] = item;
              continue;
            }

            item.x = nextPos.x;
            item.y = nextPos.y;
          }

          building = building.prev;
        }
      }

      // special case: if the segment chain loops on itself,
      // then need to determine if the entire item chain
      // has room to move. if it does then we remove the last
      // item and update all items, then place the last item
      // back into the correct spot
      // if (
      //   visited.includes(segment.end.next?.segment) &&
      //   segment.end.inventory.length === segment.end.inventorySlots &&
      //   segment.end.next.inventory.length === segment.end.next.inventorySlots
      // ) {
      //   let start = segment.end.next;
      //   let belt = start.next;
      //   let emptyBelt = false;
      //   while (belt !== start) {
      //     if (!belt.component) {
      //       emptyBelt = true;
      //       break;
      //     }

      //     belt = belt.next;
      //   }

      //   if (emptyBelt) {
      //     removed = {
      //       component: start.component,
      //       belt: start.next
      //     };
      //     start.component = null;
      //   }
      // }
    });
  }
}

const transportItemBehavior = new TransportItemBehavior();
export default transportItemBehavior;

const transportProperties = {
  // transports can only carry 1 item per stack per slot
  maxStackSize: 1,

  /**
   * Determine if the transport can add the item. Items are always added to the first inventory slot of the building.
   * @return {Boolean}
   */
  canAddItem() {
    return !this.inventory[0];
  },

  /**
   * Add an item to the transport. Items should only be added when it first enters the transport line.
   * @param {String} item - Name of the item.
   * @param {Number} amount - How much to add (not used as always is 1).
   * @return {Number} The number of items that were added (always 1).
   */
  addItem(item) {
    item = new Item(item, { count: 1 });
    const { x, y } = this.getStartPosition();
    item.x = x + (this.dir.col ? item.width * item.anchor.x : 0);
    item.y = y + (this.dir.row ? item.height * item.anchor.y : 0);
    this.inventory[0] = item;

    return 1;
  },

  removeItem(item) {
    const { inventory, inventorySlots } = this;

    for (let i = inventorySlots - 1; i >= 0; i--) {
      const stack = inventory[i];

      if (!stack) {
        continue;
      }

      const [name] = stack;

      if (name !== item) {
        continue;
      }

      stack.destroy();
      inventory[i] = undefined;

      return 1;
    }
  },

  getStartPosition() {
    const x =
      this.col * GRID_SIZE +
      (this.dir.col === 1
        ? 0
        : this.dir.col === 0
        ? GRID_SIZE / 2
        : GRID_SIZE - ITEM_SIZE);
    const y =
      this.row * GRID_SIZE +
      (this.dir.row === 1
        ? 0
        : this.dir.row === 0
        ? // transports going left/right will have a small bit
          // on the side of the transport to show so the items
          // need to be moved up slightly from center
          GRID_SIZE / 3
        : GRID_SIZE - ITEM_SIZE);

    return { x, y };
  },

  /**
   * Set an items position to exactly fit into the inventory slot.
   * @param {Item} item - Item to set position of.
   * @param {Number} [slot] - Slot number.
   */
  setItemPosition(item, slot) {
    const startPos = this.getStartPosition();
    slot ??= this.getInventorySlot(item);
    const dir = this.dir.row ? 'row' : 'col';
    const coord = this.dir.row ? 'y' : 'x';
    const size = this.dir.row ? 'height' : 'width';

    if (this.dir[dir] === -1) {
      startPos[coord] =
        startPos[coord] - ITEM_SIZE * slot + item[size] * item.anchor[coord];
    } else {
      startPos[coord] += ITEM_SIZE * slot + item[size] * item.anchor[coord];
    }

    item.x = startPos.x;
    item.y = startPos.y;
  },

  /**
   * Receive an item from a transport going a perpendicular direction.
   * @param {Item} item - Item to receive.
   */
  // getNextPos(pos, priorDir) {
  //   let { x, y } = this.getStartPosition();

  //   if (priorDir.col) {
  //     item.x = x;
  //   }
  //   else {
  //     item.y = y;
  //   }

  //   return { x, y };
  // },

  /**
   * Get the inventory item at the designated slot. Will get the previous or next building inventory item if the slot is below or above the number of inventory slots of the building.
   * @param {Number} slot - Slot index to get.
   * @return {Item|Null} Item at the slot.
   */
  getInventoryItem(slot) {
    let building = this;

    while (building && slot < 0) {
      building = building.prev;
      slot += building?.inventorySlots;
    }

    while (building && slot >= building.inventorySlots) {
      building = building.next;
      slot -= building?.inventorySlots;
    }

    if (!building) {
      return null;
    }

    return building.inventory[slot];
  },

  /**
   * Get the inventory slot that the item falls into.
   * @param {Item} item - The item.
   * @return {Number} The inventory slot index.
   */
  getInventorySlot(item) {
    const dir = this.dir.row ? 'row' : 'col';
    const coord = this.dir.row ? 'y' : 'x';
    const size = this.dir.row ? 'height' : 'width';

    if (this.dir[dir] === 1) {
      return (
        ((item[coord] +
          item[size] * item.anchor[coord] -
          this[dir] * GRID_SIZE) /
          ITEM_SIZE) |
        0
      );
    } else {
      return (
        (((this[dir] + 1) * GRID_SIZE -
          (item[coord] - item[size] * item.anchor[coord])) /
          ITEM_SIZE) |
        0
      );
    }
  }

  /**
   * Render the building and all inventory items.
   */
  // render() {
  //   this._render();
  //   this.inventory.forEach(item => item?.render());
  // }
};

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
