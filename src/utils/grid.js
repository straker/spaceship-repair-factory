import { GRID_SIZE, GAME_WIDTH, GAME_HEIGHT, TYPES } from '../constants';
import { removeFromArray } from './index';

let objects = [];
let tiles = [];
let rows = GAME_HEIGHT / GRID_SIZE;
let cols = GAME_WIDTH / GRID_SIZE;

for (let row = 0; row < rows; row++) {
  tiles[row] = [];
  for (let col = 0; col < cols; col++) {
    tiles[row][col] = [];
  }
}

// turn an x/y value into a grid row/col value
export function toGrid(value) {
  return (value / GRID_SIZE) | 0;
}

// loop over each tile an object occupies
function forEachTile([startRow, startCol, endRow, endCol], cb) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      cb(tiles[row]?.[col] ?? []);
    }
  }
}

let grid = {
  objects,

  add(obj) {
    // always add from the bottom-right corner
    // subtract 1 since a 32x32 obj should occupy one tile
    // not two (32 / 32 = 1)
    let startRow = obj.row - toGrid(obj.height - 1);
    let startCol = obj.col - toGrid(obj.width - 1);

    forEachTile([startRow, startCol, obj.row, obj.col], tile => tile.push(obj));

    if (obj.type && obj.type !== TYPES.WALL) {
      objects.push(obj);
    }
  },

  remove(obj) {
    let startRow = obj.row - toGrid(obj.height - 1);
    let startCol = obj.col - toGrid(obj.width - 1);

    forEachTile([startRow, startCol, obj.row, obj.col], tile => {
      removeFromArray(tile, obj);
    });

    removeFromArray(objects, obj);
  },

  get(pos) {
    let row = pos.row ?? (pos.y / GRID_SIZE) | 0;
    let col = pos.col ?? (pos.x / GRID_SIZE) | 0;
    return tiles[row] && tiles[row][col] ? tiles[row][col] : [];
  },

  getByType(pos, type) {
    return this.get(pos).filter(obj => obj.type === type);
  },

  getAll(obj) {
    let objs = [];
    let startRow = obj.row - toGrid(obj.height - 1);
    let startCol = obj.col - toGrid(obj.width - 1);

    forEachTile([startRow, startCol, obj.row, obj.col], tile =>
      objs.push(...tile)
    );

    return objs;
  },

  update() {
    objects.forEach(obj => {
      obj.update();
    });
  },

  render() {
    this.objects.forEach(obj => obj.render());
  }
};

export default grid;
