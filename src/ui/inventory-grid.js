import AccessibleGrid from './accessible-grid.js';
import ImageButton from './image-button.js';
import { i18n } from '../data/translations.js';

export const inventoryCols = 10;

export default class InventoryGrid extends AccessibleGrid {
  constructor(building) {
    const children = [];
    for (let i = 0; i < building.inventorySlots; i++) {
      const [ name ] = building.inventory[i] ?? [];

      children.push(new ImageButton({
        name: '',
        text: {
          text: name ? name : ''
        }
      }));
    }

    super({
      building,
      flow: 'grid',
      numCols: inventoryCols,
      children,

      // target size minimum = 48px
      rowGap: 4,
      colGap: 4
    });
  }

  update() {
    // inventory values
    if (this.building.inventorySlots) {
      for (let i = 0; i < this.building.inventorySlots; i++) {
        const [ name, amount ] = this.building.inventory[i] ?? [];
        const slot = this.children[i];

        // item was removed
        if (slot.name && !name) {
          slot.text = '';
          slot.name = '';
        }

        if (!name) {
          continue;
        }

        // item was added or updated
        if (slot.name !== name) {
          slot.name = name;
        }

        if ('' + amount !== slot.text) {
          slot.text = amount;
        }

        // TODO: item is removed from inventory
        // TODO: change item picture when added to inventory
      }
    }

    super.update();
  }
}