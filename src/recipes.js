import { secondsToTicks } from './utils';

const recipes = [
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
    name: 'IRON',
    inputs: [
      {
        name: 'ASTEROID',
        total: 1,
        has: 0
      }
    ],
    outputs: [
      {
        name: 'IRON',
        total: 2,
        has: 0
      }
    ],
    duration: secondsToTicks(3.2)
  },
  {
    name: 'COPPER',
    inputs: [
      {
        name: 'ASTEROID',
        total: 1,
        has: 0
      }
    ],
    outputs: [
      {
        name: 'COPPER',
        total: 1,
        has: 0
      }
    ],
    duration: secondsToTicks(3.2)
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
    duration: 5
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
    duration: 5
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
    duration: 5
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
    duration: 5
  }
];
export default recipes;