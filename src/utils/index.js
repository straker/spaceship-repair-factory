import { degToRad } from '../lib/kontra.js';

// remove an item from an array
export function removeFromArray(array, item) {
  let index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
  return index;
}

// rotation between 0-360 but don't go outside that range
export function rotate(obj, deg) {
  return (obj.rotation + degToRad(deg)) % (Math.PI * 2);
}
