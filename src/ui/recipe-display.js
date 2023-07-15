import ImageButton, { buttonSize } from './image-button.js';
import { Text, imageAssets, GridClass, on } from '../libs/kontra.js';
import { i18n } from '../data/translations.js';
import RecipeDialog from './recipe-dialog.js';

export default class RecipeDisplay extends GridClass {
  constructor(building) {
    super({
      flow: 'row',
      colGap: 4,
      building
    });

    let inputs = [];
    let outputs = [];

    const recipeDialog = this.recipeDialog = new RecipeDialog();

    this.setRecipeButton = new ImageButton({
      name: i18n('Set Recipe'),
      image: imageAssets.icons,
      // gear
      iconx: 0,
      icony: 0,
      onDown() {
        recipeDialog.show(building);
      }
    });

    if (building.recipe) {
      this.showRecipe();
    }
    else {
      this.hideRecipe();
    }

    on('RecipeGrid:set-recipe', () => {
      this.showRecipe();
    });
  }

  showRecipe() {
    // TODO: recipe display shows set recipe button and when
    // building updates recipe will update the display to show
    // it
    // on('RecipeGrid:set-recipe', () => {
    this.inputs = this.building.inputs.map(([ name, amount ], index) => {
      const [ , max ] = this.building.recipe.inputs[index];

      // TODO: these shouldn't be intractable / buttons but
      // instead a single DOM node (like an image) that
      // describes the recipe
      return new ImageButton({
        name,
        text: {
          text: `${amount} / ${max}`
        }
      });
    });

    this.outputs = this.building.outputs.map(([ name, amount ], index) => {
      const [ , max ] = this.building.recipe.outputs[index];
      return new ImageButton({
        name,
        // disabled: true,
        text: {
          text: `${amount} / ${max}`
        }
      });
    });

    this.children = [
      ...this.inputs,
      Text({
        text: '⇒',
        width: buttonSize,
        height: buttonSize,
        anchor: { x: 0.5, y: 0.5 },
        textAlign: 'center',
        font: '30px Arial',
        vertAlign: 'center'
      }),
      ...this.outputs,
      // TODO: hack to fill space
      Text({
        text: '',
        width: buttonSize
      }),
      this.setRecipeButton
    ];
  }

  hideRecipe() {
    this.children = [this.setRecipeButton];
    this.inputs = null;
    this.outputs = null;
  }

  destroy() {
    this.recipeDialog.destroy();
    super.destroy();
  }

  update() {
    if (this.building.recipe) {
      this.building.inputs.forEach(([ name, amount ], index) => {
        const [ , max ] = this.building.recipe.inputs[index];
        const slot = this.inputs[index];
        slot.text = `${amount} / ${max}`;
      });

      this.building.outputs.forEach(([ name, amount ], index) => {
        const [ , max ] = this.building.recipe.outputs[index];
        const slot = this.outputs[index];
        slot.text = `${amount} / ${max}`;
      });
    }

    super.update();
  }
}