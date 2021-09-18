import { on } from '../libs/kontra';
import { removeFromArray } from '../utils';
import Assembler from '../buildings/assembler';

let assemblers = [];

let assemblerManager = {
  init() {
    on('gameTick', () => {
      assemblers.forEach(assembler => {
        let { recipe, components, producing, timer } = assembler;

        if (!producing && timer === 0) {
          if (assembler.canProduce() && assembler.hasRequiredInputs()) {
            assembler.producing = true;
            recipe.inputs.forEach(input => {
              input.has -= input.total;
            });
          }
        }

        if (assembler.producing && ++assembler.timer >= recipe.duration) {
          assembler.timer = 0;
          assembler.producing = false;
          recipe.outputs.forEach(output => {
            for (let i = 0; i < output.total; i++) {
              components.push({
                name: output.name
              });
            }
          });
        }
      });
    });
  },

  add(properties) {
    let assembler = new Assembler(properties);
    assemblers.push(assembler);
    return assembler;
  },

  remove(assembler) {
    removeFromArray(assemblers, assembler);
  },

  // assembler can only be placed on empty spots
  canPlace(cursor, items) {
    return !items.length;
  }
};

export default assemblerManager;
