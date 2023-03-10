import startingState from './data/starting-state.js';

const state = {
  ...startingState
};

export function setState(name, value) {
  state[name] = value;
}

export function getState(name) {
  return state[name];
}