import AccessibleGrid from './accessible-grid.js';
import ImageButton from './image-button.js';
import { i18n } from '../data/translations.js';
import { recipes } from '../data/items.js';
import { emit } from '../libs/kontra.js';

export const recipeCols = 10;

export default class RecipeGrid extends AccessibleGrid {
  constructor(building) {
    const children = Object.values(recipes)
      .filter(recipe => recipe.craftedBy.includes(building.id))
      .map(recipe => {
        return new ImageButton({
          name: recipe.name,
          onDown() {
            building.setRecipe(recipe);
            emit('RecipeGrid:set-recipe');
          }
        });
      });

    super({
      building,
      flow: 'grid',
      numCols: recipeCols,
      children: [
        new ImageButton({
          name: i18n('No recipe'),
          onDown() {
            // TODO: how do we do this?
            building.setRecipe(null);
            emit('RecipeGrid:set-recipe');
          }
        }),
        ...children
      ],

      // target size minimum = 48px
      rowGap: 4,
      colGap: 4
    });
  }
}