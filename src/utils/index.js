import { DIRS } from '../constants';
import { degToRad } from '../libs/kontra';

export function getSign(number) {
  return number < 0 ? -1 : number > 0 ? 1 : 0;
}

export function getDx(dir, speed) {
  return dir === DIRS.RIGHT ? speed : dir === DIRS.LEFT ? -speed : 0;
}

export function getDy(dir, speed) {
  return dir === DIRS.DOWN ? speed : dir === DIRS.UP ? -speed : 0;
}

// current time (t) to move from point b to point c in a certain
// duration (d)
// @see http://gizma.com/easing/#l
export function easeLinear(t, b, c, d) {
  return (c * t) / d + b;
}

export function easeInQuad(t, b, c, d) {
  t /= d;
  return c * t * t + b;
}

export function easeOutQuad(t, b, c, d) {
  t /= d;
  return -c * t * (t - 2) + b;
}

export function easeInOutQuad(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
}

export function easeInCubic(t, b, c, d) {
  t /= d;
  return c * t * t * t + b;
}

// rotation between 0-360 but don't go outside that range
export function rotate(obj, deg) {
  return (obj.rotation + degToRad(deg)) % (Math.PI * 2);
}

export function displayComponentValue(value) {
  if (value < 1000) {
    return ('' + value).padEnd(4, ' ');
  }

  return `${(value / 1000) | 0}K`.padEnd(4, ' ');
}

export function titleCase(str) {
  return str
    .split('-')
    .map(txt => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    })
    .join(' ');
}

export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function removeFromArray(array, item) {
  let index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
  return index;
}
