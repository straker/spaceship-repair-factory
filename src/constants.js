const canvas = document.querySelector('canvas');
export const GRID_SIZE = 32;
export const GAME_WIDTH = canvas.width;
export const GAME_HEIGHT = canvas.height;

export const TYPES = {
  component: 0,
  building: 1,
  belt: 2,
  assembler: 3
};

// dir values by name, degree, and radian
const right = { row: 0, col: 1 };
const down = { row: 1, col: 0 };
const left = { row: 0, col: -1 };
const up = { row: -1, col: 0 };
export let DIRS = {
  right,
  0: right,
  down,
  [Math.PI / 2]: down,
  90: down,
  left,
  [Math.PI]: left,
  180: left,
  up,
  [Math.PI * 1.5]: up,
  270: up
};
