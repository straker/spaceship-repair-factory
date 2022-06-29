export let GRID_SIZE = 16;
export let NUM_ROWS = 36;
export let NUM_COLS = 34;
export let GAME_WIDTH = GRID_SIZE * NUM_COLS;
export let GAME_HEIGHT = GRID_SIZE * NUM_ROWS;

export let TYPES = {
  WALL: 0,
  BELT: 1,
  COMPONENT: 2,
  MOVER: 3,
  MINER: 4,
  ASSEMBLER: 5,
  SHIP: 6,

  FILTER: 10,
  RECIPE: 11,
  TIP: 12,
  INFO: 13
};
export let COMPONENTS = [
  'ASTEROID',
  'COPPER',
  'IRON',
  'TITANIUM',
  'HYDROGEN',
  'OXYGEN',
  'WIRE',
  'CIRCUIT',
  'WATER',
  'FUEL'
];
export let START_COMPONENTS = {
  COPPER: 150,
  IRON: 150
};
// dir values by name, degree, and radian
let RIGHT = { row: 0, col: 1 };
let DOWN = { row: 1, col: 0 };
let LEFT = { row: 0, col: -1 };
let UP = { row: -1, col: 0 };
export let DIRS = {
  RIGHT,
  0: RIGHT,
  DOWN,
  [Math.PI / 2]: DOWN,
  90: DOWN,
  LEFT,
  [Math.PI]: LEFT,
  180: LEFT,
  UP,
  [Math.PI * 1.5]: UP,
  270: UP
};
export let COLORS = {
  WHITE: '#cfc6b8',
  BLACK: '#333333',
  GREY: '#777777',
  RED: '#e6482e',
  YELLOW: '#f4b41b',
  GREEN: '#38d973',
  BLUE: '#3cacd7',
  BROWN: '#bf7958',
  PURPLE: '#472d3c'
};
// 200 ms (200ms / 1000 ms = 0.2)
export let TICK_DURATION = 0.2;
export let TEXT_PROPS = {
  font: `${GRID_SIZE}px Arial`,
  color: COLORS.WHITE,
  anchor: { x: 0, y: 0.5 }
};
// miner produce every n game ticks
export let MINER_DURATION = 20;