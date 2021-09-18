import { GRID_SIZE, TYPES, DIRS, COLORS } from '../constants';
import GameObject from '../utils/game-object';
import { getPointer, imageAssets } from '../libs/kontra';
import grid, { toGrid } from '../utils/grid';
import { rotate } from '../utils';
import tileatlas from '../assets/tileatlas.json';

let cursor;

class Cursor extends GameObject {
  constructor() {
    super({
      context: game.getContext('2d')
    });

    this.state = 'building';
    this.dir = DIRS.RIGHT;
  }

  setImage(name) {
    let [ a, b, atlasWidth, atlasHeight ] = tileatlas[name] ?? [];
    this.name = name;

    if (name) {
      this.state = 'building';
    } else {
      this.state = 'cursor';
    }

    this.rotation = 0;
    this.width = (atlasWidth ?? 1) * GRID_SIZE;
    this.height = (atlasHeight ?? 1) * GRID_SIZE;
  }

  hide() {
    game.style.cursor = 'default';
    this.hidden = true;
  }

  show() {
    cursor.hidden = false;

    let atlas = tileatlas[this.name];
    if (atlas) {
      game.style.cursor = 'none';
    } else if (this.state === 'delete') {
      game.style.cursor = 'no-drop';
    } else {
      game.style.cursor = 'default';
    }
  }

  update() {
    let [ a, b, atlasWidth, atlasHeight ] = tileatlas[this.name] ?? [0, 0, 1, 1];
    let pointer = getPointer();

    this.x = (toGrid(pointer.x) + (1 - 0.5 * atlasWidth)) * GRID_SIZE;
    this.y = (toGrid(pointer.y) + (1 - 0.5 * atlasHeight)) * GRID_SIZE;
    this.row = toGrid(this.y);
    this.col = toGrid(this.x);

    if (!this.name || this.hidden) return;

    // show import / export belt when appropriate
    let item = grid.get(this)[0];
    if (['BELT', 'EXPORT', 'IMPORT'].includes(this.name)) {
      if (!item) {
        this.name = 'BELT';
      } else if (item.type === TYPES.WALL) {
        if (item.dir === this.dir) {
          this.name = 'EXPORT';
        } else if (item.dir === DIRS[rotate(this, 180)]) {
          this.name = 'IMPORT';
        } else {
          this.name = 'BELT';
        }
      }
    }
  }

  drawOutline({ row = this.row, col = this.col, width, height }) {
    let { context, row: thisRow, col: thisCol } = this;
    let [ atlasRow, atlasCol ] = tileatlas.CURSOR;
    for (let i = 0; i < 4; i++) {
      let sx =
        i % 2 === 1 ? (atlasCol + 1) * GRID_SIZE - 4 : atlasCol * GRID_SIZE;
      let sy =
        i >= 2 ? (atlasRow + 1) * GRID_SIZE - 4 : atlasRow * GRID_SIZE;
      let x = i % 2 === 1 ? width - 4 : 0;
      let y = i >= 2 ? height - 4 : 0;

      context.drawImage(
        imageAssets.tilesheet,
        sx,
        sy,
        4,
        4,
        (col - thisCol) * GRID_SIZE + x,
        (row - thisRow) * GRID_SIZE + y,
        4,
        4
      );
    }
  }

  draw() {
    let items = grid.getAll(this);

    if (this.hidden) return;

    if (this.name) {
      let { context, width, height } = this;

      context.save();
      context.globalAlpha = 0.6;
      super.draw();

      if (!this.valid) {
        context.fillStyle = COLORS.RED;
        context.fillRect(0, 0, width, height);
      }
      context.restore();

      this.drawOutline({ width, height });
    } else if (items.length) {
      let item = items.find(item => item.type && item.type !== TYPES.WALL);

      if (
        (item?.menuType && this.state !== 'delete') ||
        (item && this.state === 'delete' && item.type !== TYPES.SHIP)
      ) {
        let { row, col, width, height } = item;

        // item position is from the bottom-right corner
        if (height > GRID_SIZE) {
          row--;
        }
        if (width > GRID_SIZE) {
          col--;
        }

        this.drawOutline({ row, col, width, height });
      }
    }
  }
}

cursor = new Cursor();
export default cursor;
