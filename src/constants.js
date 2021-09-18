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
export let MINER_DURATIONS = {
  COPPER: 10,
  IRON: 10,
  TITANIUM: 10,
  HYDROGEN: 10,
  OXYGEN: 10
};
export let RECIPES = [
  {
    name: 'NONE',
    inputs: [
      {
        name: 'NONE'
      }
    ],
    outputs: [
      {
        name: 'NONE'
      }
    ]
  },
  {
    name: 'WIRE',
    inputs: [
      {
        name: 'COPPER',
        total: 1,
        has: 0
      }
    ],
    outputs: [
      {
        name: 'WIRE',
        total: 2,
        has: 0
      }
    ],
    duration: 5 // game ticks
  },
  {
    name: 'CIRCUIT',
    inputs: [
      {
        name: 'WIRE',
        total: 2,
        has: 0
      },
      {
        name: 'IRON',
        total: 1,
        has: 0
      }
    ],
    outputs: [
      {
        name: 'CIRCUIT',
        total: 1,
        has: 0
      }
    ],
    duration: 5 // game ticks
  },
  {
    name: 'WATER',
    inputs: [
      {
        name: 'HYDROGEN',
        total: 1,
        has: 0
      },
      {
        name: 'OXYGEN',
        total: 2,
        has: 0
      }
    ],
    outputs: [
      {
        name: 'WATER',
        total: 1,
        has: 0
      }
    ],
    duration: 5 // game ticks
  },
  {
    name: 'FUEL',
    inputs: [
      {
        name: 'HYDROGEN',
        total: 10,
        has: 0
      },
      {
        name: 'TITANIUM',
        total: 4,
        has: 0
      }
    ],
    outputs: [
      {
        name: 'FUEL',
        total: 1,
        has: 0
      }
    ],
    duration: 5 // game ticks
  }
];
let beltCost = [
  {
    name: 'IRON',
    total: 1
  }
];
export let COSTS = {
  BELT: beltCost,
  IMPORT: beltCost,
  EXPORT: beltCost,
  MOVER: [
    {
      name: 'COPPER',
      total: 2
    },
    {
      name: 'IRON',
      total: 2
    }
  ],
  REPAIRER: [
    {
      name: 'IRON',
      total: 50
    },
    {
      name: 'COPPER',
      total: 50
    }
  ],
  'COPPER-MINER': [
    {
      name: 'IRON',
      total: 5
    }
  ],
  'IRON-MINER': [
    {
      name: 'COPPER',
      total: 10
    }
  ],
  'TITANIUM-MINER': [
    {
      name: 'COPPER',
      total: 50
    },
    {
      name: 'IRON',
      total: 25
    },
    {
      name: 'CIRCUIT',
      total: 25
    }
  ],
  'HYDROGEN-EXTRACTOR': [
    {
      name: 'IRON',
      total: 50
    },
    {
      name: 'TITANIUM',
      total: 25
    },
    {
      name: 'CIRCUIT',
      total: 100
    }
  ],
  'OXYGEN-EXTRACTOR': [
    {
      name: 'IRON',
      total: 25
    },
    {
      name: 'TITANIUM',
      total: 50
    },
    {
      name: 'CIRCUIT',
      total: 100
    }
  ],
  ASSEMBLER: [
    {
      name: 'COPPER',
      total: 25
    },
    {
      name: 'IRON',
      total: 25
    }
  ]
};
