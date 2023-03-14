// import startingState from './data/starting-state.js';
import { emit } from './libs/kontra.js';

const state = {
  // ...startingState
};
window.state = state;

export function setState(name, value) {
  state[name] = value;
  emit(`state:changed:${name}`, value);
}

export function getState(name, defaultValue) {
  return state[name] ?? defaultValue;
}