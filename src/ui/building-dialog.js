import { GRID_SIZE, TEXT_PROPS } from '../constants.js';
import { Grid, Text } from '../libs/kontra.js';
import Dialog from './dialog.js';
import ImageButton, { buttonSize } from './image-button.js';
import { i18n } from '../data/translations.js';

export default class BuildingDialog extends Dialog {
  constructor(building, properties = {}) {
    const body = [];

    // recipe
    if ('recipe' in building) {
      if (!building.recipe) {
        body.push(
          Text({
            ...TEXT_PROPS,
            text: i18n('Recipe'),
            // colGap: properties.inventoryGrid.numCols
          }),
          new ImageButton({

          })
        )
      }
    }

    // inventory
    if (building.inventorySlots) {
      properties.inventoryGrid = Grid({
        flow: 'grid',
        numCols: 10,

        // target size minimum = 48px
        rowGap: 4,
        colGap: 4
      });

      const children = [];
      for (let i = 0; i < building.inventorySlots; i++) {
        const item = building.inventory[i];

        children.push(new ImageButton({
          text: {
            text: item ? item[1] : ''
          }
        }))
      }

      properties.inventoryGrid.children = children;
      body.push(
        Text({
          ...TEXT_PROPS,
          text: i18n('Inventory'),
          colGap: properties.inventoryGrid.numCols
        }),
        properties.inventoryGrid
      );
    }

    super(building.name, {
      ...properties,
      building,
      body
    });
  }

  update() {
    // inventory values
    if (this.building.inventorySlots) {
      for (let i = 0; i < this.building.inventorySlots; i++) {
        const item = this.building.inventory[i];
        const slot = this.inventoryGrid.children[i];

        if (item && '' + item[1] !== slot.text) {
          slot.text = item[1];
        }
      }
    }
  }
}