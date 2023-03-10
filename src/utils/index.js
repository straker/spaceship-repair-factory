import { degToRad, rotatePoint } from '../libs/kontra.js';
import { GRID_SIZE } from '../constants.js';

/**
 * Remove an item from an array.
 * @param {*[]} array - Array to remove item from.
 * @param {*} item - Item to remove.
 * @return {Number|undefined} The index of the removed item.
 */
export function removeFromArray(array, item, { splice = true } = {}) {
  let index = array.indexOf(item);
  if (index > -1) {
    if (splice) {
      array.splice(index, 1);
    } else {
      delete array[index];
    }
    return index;
  }
}

/**
 * Rotate an object and ensure the final value is between 0 and Math.PI * 2.
 * @param {Object} object - Object to rotate.
 * @param {Number} deg - How much to rotate (in degrees).
 * @return {Number} The final rotation (in radians).
 */
export function rotate(object, deg) {
  return (object.rotation + degToRad(deg)) % (Math.PI * 2);
}

/**
 * Rotate a position around the angle.
 * @param {Object} pos - Current position.
 * @param {Number} angle - Angle of rotation (in radians).
 * @return {Object} The row and column of the rotation.
 */
export function rotatePosition(pos, angle) {
  let point = {
    x: pos.col * GRID_SIZE,
    y: pos.row * GRID_SIZE
  };
  point = rotatePoint(point, angle);

  return {
    row: point.y <= 0 ? 0 : Math.round(point.y) / GRID_SIZE,
    col: point.x <= 0 ? 0 : Math.round(point.x) / GRID_SIZE
  };
}

/**
 * Return the position one behind the current position.
 * @param {Object} pos - Current position.
 * @param {Object} dir - Current direction.
 * @return {Object} The row and column of the new position.
 */
export function getPrevPos(pos, dir) {
  return {
    row: pos.row + dir.row * -1,
    col: pos.col + dir.col * -1
  };
}

/**
 * Return the position one in front of the current position.
 * @param {Object} pos - Current position.
 * @param {Object} dir - Current direction.
 * @return {Object} The row and column of the new position.
 */
export function getNextPos(pos, dir) {
  return {
    row: pos.row + dir.row,
    col: pos.col + dir.col
  };
}

/**
 * Deep copy an array or object.
 * @see https://javascript.plainenglish.io/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
 * @param {Object} object - The array or object to copy.
 * @return {Object} A new copy of the object.
 */
export function deepCopy(object) {
  if (typeof object !== 'object' || object === null) {
    return object;
  }

  const copy = Array.isArray(object) ? [] : {};
  for (const key in object) {
    copy[key] = deepCopy(object[key]);
  }

  return copy;
}

/**
 * Keep track of changes to the recipe by each mod in the order they were changed.
 * @param {Object} object - The object the mod affects.
 * @param {Object} changes - Changes to the object.
 * @return {Object} A new object with the changes applied.
 */
export function addModChanges(object, changes) {
  // need to pull mod out but doing this results in unused var
  // eslint-disable-next-line no-unused-vars
  const { mod, ...props } = changes;
  object.modChanges = object.modChanges ?? [];
  object.modChanges.push(changes);

  return Object.assign(object, props);
}

/**
 * Fully or partially add an item to an item stack.
 * @param {(String|Number)[][]} stack - stack to add to.
 * @param {Number} amount - How much to add.
 * @param {Number} max - Max size of the stack.
 * @return {Number} The number of items that were added.
 */
export function addToStack(stack, amount, max) {
  const [, count] = stack;
  const diff = count + amount - max;

  // fully add to stack
  if (diff <= 0) {
    stack[1] += amount;
    return amount;
  }

  // partially add to stack
  stack[1] = max;
  return amount - diff;
}

/**
 * Fully or partially remove an item from an item stack.
 * @param {(String|Number)[][]} stack - stack to remove from.
 * @param {Number} amount - How much to remove.
 * @param {Array} slots - The slots that contain the stack.
 * @param {Object} [options]
 * @param {Boolean} [options.deleteStack=false] - If the stack should be deleted when it reaches 0 items.
 * @return {Number} The number of items that were removed.
 */
export function removeFromStack(
  stack,
  amount,
  slots,
  { deleteStack = false } = {}
) {
  const [, count] = stack;
  let diff = amount - count;

  // fully remove from stack
  if (diff <= 0) {
    stack[1] -= amount;
    diff = 0;
  } else {
    // partially remove from stack
    stack[1] = 0;
  }

  if (stack[1] === 0 && deleteStack) {
    removeFromArray(slots, stack, { splice: false });
  }

  return amount - diff;
}
