import { GRID_SIZE, TEXT_PROPS } from '../constants.js';
import { Text, imageAssets, Grid, on } from '../libs/kontra.js';
import Dialog from './dialog.js';
import ImageButton from './image-button.js';
import RecipeGrid from './recipe-grid.js';
import InventoryGrid from './inventory-grid.js';
import { i18n } from '../data/translations.js';

export default class BuildingDialog extends Dialog {
  show(building) {
    this.body = [new RecipeGrid(building)];
    on('RecipeGrid:set-recipe', () => {
      this.hide();
    });

    super.show(i18n('Select a Recipe'));
  }
}