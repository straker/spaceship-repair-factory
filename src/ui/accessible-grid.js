import { GridClass, onKey } from '../libs/kontra.js';
import { i18n } from '../data/translations.js';

export default class AccessibleGrid extends GridClass {
  constructor(properties) {
    super(properties);

    const gridNode = this._dn = document.createElement('table');
    gridNode.setAttribute('role', 'grid');
    gridNode.setAttribute('aria-label', i18n('Inventory'));
    gridNode.classList.add('sr-only');

    this.cells = [];

    const numRows = Math.ceil(properties.children.length / properties.numCols);
    for (let row = 0; row < numRows; row++) {
      const rowNode = document.createElement('tr');
      gridNode.appendChild(rowNode);

      for (let col = 0; col < properties.numCols; col++) {
        const child = properties.children[row * properties.numCols + col];
        if (!child) {
          break;
        }

        const cellNode = document.createElement('td');
        rowNode.appendChild(cellNode);

        let cell;

        // when a cell contains an interactive element that
        // element becomes the focus target for the cell
        if (child._dn) {
          cell = child._dn;
          cellNode.appendChild(child._dn);
        }
        else {
          cell = cellNode;
          cellNode.setAttribute('aria-label', i18n('Empty'));
        }

        cell.setAttribute('tabindex', -1);
        this.cells.push(cell);

        // keep track of when one of the cells is focused so we
        // can tell when the entire grid is in focus and should
        // allow keyboard controls. this works as the blur event
        // is fired before the focus event
        this.isFocused = false;
        cell.addEventListener('focus', () => {
          this.isFocused = true;
        });
        cell.addEventListener('blur', () => {
          this.isFocused = false;
        });
      }
    }

    document.body.appendChild(gridNode);

    if (this.cells[0]) {
      this.cells[0].setAttribute('tabindex', 0);
    }

    // keep track of cell position
    this.curIndex = 0;

    // TODO: work with gamepad
    onKey('arrowleft', () => {
      if (
        this.isFocused &&
        this.curIndex > 0 &&
        this.curIndex % this.numCols !== 0
      ) {
        this.updateFocus(this.curIndex - 1);
      }
    });

    onKey('arrowright', () => {
      if (
        this.isFocused &&
        this.curIndex < this.cells.length - 1 &&
        this.curIndex % this.numCols !== this.numCols - 1
      ) {
        this.updateFocus(this.curIndex + 1);
      }
    });

    onKey('arrowup', () => {
      if (
        this.isFocused &&
        this.curIndex - this.numCols >= 0 &&
        this.curIndex >= this.numCols
      ) {
        this.updateFocus(this.curIndex - this.numCols);
      }
    });

    onKey('arrowdown', () => {
      if (
        this.isFocused &&
        this.curIndex + this.numCols <= this.cells.length - 1 &&
        this.curIndex <= this.cells.length - this.numCols
      ) {
        this.updateFocus(this.curIndex + this.numCols);
      }
    });
  }

  destroy() {
    super.destroy();
    this._dn.remove();
  }

  updateFocus(nextIndex) {
    this.cells[this.curIndex].setAttribute('tabindex', -1);
    this.cells[nextIndex].setAttribute('tabindex', 0);
    this.cells[nextIndex].focus();
    this.curIndex = nextIndex;
  }
}