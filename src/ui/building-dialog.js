import { GRID_SIZE, TEXT_PROPS } from '../constants.js';
import { Text, imageAssets, Grid, on } from '../libs/kontra.js';
import Dialog from './dialog.js';
import ImageButton, { buttonSize } from './image-button.js';
import RecipeDisplay from './recipe-display.js';
import InventoryGrid from './inventory-grid.js';
import { i18n } from '../data/translations.js';

export default class BuildingDialog extends Dialog {
  constructor(properties = {}) {
    super({
      ...properties,
      rowGap: [GRID_SIZE / 2, GRID_SIZE / 2, GRID_SIZE]
    });
  }

  show(building) {
    this.body = [];

    // recipe
    if ('recipe' in building) {
      this.body.push(
        Text({
          ...TEXT_PROPS,
          text: i18n('Recipe'),
        }),
        new RecipeDisplay(building)
      );
    }

    // inventory
    if (building.inventorySlots) {
      this.body.push(
        Text({
          ...TEXT_PROPS,
          text: i18n('Inventory')
        }),
        new InventoryGrid(building)
      );
    }

    super.show(building.name);
  }
}