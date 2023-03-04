const canvas = document.querySelector('canvas');
export const GRID_SIZE = 32;
export const ITEM_SIZE = GRID_SIZE / 2;
export const GAME_WIDTH = canvas.width;
export const GAME_HEIGHT = canvas.height;

// maximum crafting input and output storage amount (3x recipe)
export const MAX_CRAFT_STORAGE = 3;

// use a bitmask in order to store multiple types in one value
export const TYPES = {
  component: 1,
  building: 2,
  transport: 4,
  assembler: 8
};

export let COLORS = {
  white: '#cfc6b8',
  black: '#333333',
  grey: '#777777',
  red: '#e6482e',
  yellow: '#f4b41b',
  green: '#38d973',
  blue: '#3cacd7',
  brown: '#bf7958',
  purple: '#472d3c'
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

export const TEXT_PROPS = {
  font: `${GRID_SIZE}px Arial`,
  color: COLORS.white,
  anchor: { x: 0, y: 0.5 }
};