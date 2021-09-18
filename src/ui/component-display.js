import { Grid, Text } from '../libs/kontra';
import { COMPONENTS, GRID_SIZE, TEXT_PROPS } from '../constants';
import Component from '../components/component';
import componentStorage from '../components/storage';
import { displayComponentValue } from '../utils';

let grid;
let componentDisplay = {
  init() {
    let children = [];

    COMPONENTS.forEach(name => {
      children.push(
        new Component({ name }),
        Text({
          ...TEXT_PROPS,
          name,
          text: displayComponentValue(0)
        })
      );
    });

    grid = Grid({
      x: GRID_SIZE,
      y: GRID_SIZE / 4,
      flow: 'row',
      align: 'center',
      colGap: [GRID_SIZE / 4, GRID_SIZE],
      children
    });
  },

  render() {
    grid.children.forEach(child => {
      if (child.text) {
        // save some processing power by not updating the text value
        // if it hasn't chaned
        let value = displayComponentValue(componentStorage[child.name]);
        if (child.text !== value) {
          child.text = value;
        }
      }
    });
    grid.render();
  }
};
export default componentDisplay;
