import { GRID_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { removeFromArray, toGrid, getDimensions } from './index.js';

let objects = [];
let tiles = [];
let rows = (GAME_HEIGHT / GRID_SIZE) | 0;
let cols = (GAME_WIDTH / GRID_SIZE) | 0;

for (let row = 0; row < rows; row++) {
  tiles[row] = [];
  for (let col = 0; col < cols; col++) {
    tiles[row][col] = [];
  }
}

// loop over each tile an object occupies
function forEachTile({startRow, startCol, endRow, endCol}, cb) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      cb(tiles[row]?.[col] ?? []);
    }
  }
}

const grid = {
  objects,

  add(obj) {
    forEachTile(getDimensions(obj), tile => tile.push(obj));
    objects.push(obj);
  },

  remove(obj) {
    let startRow = obj.row + toGrid(obj.height - 1);
    let startCol = obj.col + toGrid(obj.width - 1);

    forEachTile(getDimensions(obj), tile => {
      removeFromArray(tile, obj);
    });

    removeFromArray(objects, obj);
  },

  get(pos) {
    let row = pos.row ?? toGrid(pos.y);
    let col = pos.col ?? toGrid(pos.x);
    return tiles[row]?.[col] ?? [];
  },

  getByType(pos, type) {
    return this.get(pos).filter(obj => obj.type & type);
  },

  getAll(obj) {
    let objs = [];
    forEachTile(getDimensions(obj), tile =>
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
  },

  _reset() {
    for (let row = 0; row < rows; row++) {
      tiles[row] = [];
      for (let col = 0; col < cols; col++) {
        tiles[row][col] = [];
      }
    }
  }
};

export default grid;
