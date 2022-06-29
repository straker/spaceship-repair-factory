import { GRID_SIZE, TYPES } from '../constants';
import recipes from '../recipes';
import GameObject from '../utils/game-object';
import { deepCopy } from '../utils';

export default class Assembler extends GameObject {
  constructor(properties) {
    properties.width = properties.height = GRID_SIZE * 2;
    properties.type = TYPES.ASSEMBLER;
    properties.name = 'ASSEMBLER';
    properties.timer = 0;
    properties.recipe = recipes[0]; // none
    properties.components = [];
    properties.maxComponents = 2; // max input and output number multiplier
    properties.menuType = TYPES.RECIPE;

    super(properties);
  }

  setRecipe(recipe) {
    this.components = [];
    this.recipe.inputs?.forEach(input => {
      input.has = 0;
    });
    this.recipe = deepCopy(recipe);
  }

  getInput(component) {
    return this.recipe.inputs?.find(input => input.name === component.name);
  }

  addComponent(component) {
    let input = this.getInput(component);
    input.has++;
  }

  canProduce() {
    return this.recipe.outputs?.every(output => {
      return (
        this.components.filter(component => component.name === output.name)
          .length + output.total <=
        this.maxComponents * output.total
      );
    });
  }

  hasRequiredInputs() {
    return this.recipe.inputs?.every(input => {
      return input.has >= input.total;
    });
  }

  canTakeComponent(component) {
    let input = this.getInput(component);
    return input?.has < this.maxComponents * input?.total;
  }
}
