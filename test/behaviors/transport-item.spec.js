import Building from '../../src/building.js';
import { buildings } from '../../src/data/buildings.js';
import transportItemBehavior, {
  _transportSegments
} from '../../src/behaviors/transport-item.js';
import grid from '../../src/utils/grid.js';
import { GRID_SIZE } from '../../src/constants.js';
import { TYPES, DIRS } from '../../src/constants.js';

describe('behaviors.transport-item', () => {
  let building;
  let nextBuilding;
  let prevBuilding;
  let otherBuilding;
  let other2Building;

  beforeEach(() => {
    buildings.foo = {
      inventorySlots: 1,
      behaviors: []
    };
  });

  afterEach(() => {
    building?.destroy();
    nextBuilding?.destroy();
    prevBuilding?.destroy();
    otherBuilding?.destroy();
    other2Building?.destroy();

    building = null;
    nextBuilding = null;
    prevBuilding = null;
    otherBuilding = null;
    other2Building = null;
  });

  after(() => {
    delete buildings.foo;
  });

  describe('add', () => {
    it('should only allow one', () => {
      building = new Building('foo');
      transportItemBehavior.add(building, { foo: 1 });
      transportItemBehavior.add(building, { bar: 2 });
      assert.lengthOf(building.behaviors.transportItem, 1);
      assert.equal(building.behaviors.transportItem[0].bar, 2);
    });

    it('should set building to be transport type', () => {
      building = new Building('foo');
      transportItemBehavior.add(building);
      assert.isOk(building.type & TYPES.transport);
    });

    it('should add a segment to the building', () => {
      building = new Building('foo', {
        row: 5,
        col: 5,
        width: GRID_SIZE,
        height: GRID_SIZE
      });
      transportItemBehavior.add(building);
      assert.exists(building.segment);
    });

    it('should add the segment to transportSegments', () => {
      building = new Building('foo', {
        row: 5,
        col: 5,
        width: GRID_SIZE,
        height: GRID_SIZE
      });
      transportItemBehavior.add(building);
      assert.deepEqual(_transportSegments, [building.segment]);
    });

    it('should set the start and end of the segment to the building', () => {
      building = new Building('foo', {
        row: 5,
        col: 5,
        width: GRID_SIZE,
        height: GRID_SIZE
      });
      transportItemBehavior.add(building);
      assert.deepEqual(building.segment, { start: building, end: building });
    });

    describe('next building', () => {
      beforeEach(() => {
        building = new Building('foo', {
          row: 5,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        nextBuilding = new Building('foo', {
          row: 5,
          col: 6,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      });

      describe('same dir', () => {
        beforeEach(() => {
          transportItemBehavior.add(nextBuilding);
          transportItemBehavior.add(building);
        });

        it('should set "next" to next transport building', () => {
          assert.equal(building.next, nextBuilding);
        });

        it('should set "prev" to the building', () => {
          assert.equal(nextBuilding.prev, building);
        });

        it('should add the segments together', () => {
          assert.equal(building.segment, nextBuilding.segment);
        });

        it('should update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, nextBuilding);
        });
      });

      describe('different dir', () => {
        beforeEach(() => {
          nextBuilding.dir = DIRS.up;
          transportItemBehavior.add(nextBuilding);
          transportItemBehavior.add(building);
        });

        it('should set "next" to next transport building', () => {
          assert.equal(building.next, nextBuilding);
        });

        it('should not set "prev" to the building', () => {
          assert.notEqual(nextBuilding.prev, building);
        });

        it('should not add the segments together', () => {
          assert.notEqual(building.segment, nextBuilding.segment);
        });

        it('should not update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, building);
        });
      });

      describe('not transport building', () => {
        beforeEach(() => {
          nextBuilding.dir = DIRS.up;
          grid.add(nextBuilding);
          transportItemBehavior.add(building);
        });

        it('should not set "next" to next transport building', () => {
          assert.notEqual(building.next, nextBuilding);
        });

        it('should not set "prev" to the building', () => {
          assert.notEqual(nextBuilding.prev, building);
        });

        it('should not add the segments together', () => {
          assert.notEqual(building.segment, nextBuilding.segment);
        });

        it('should not update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, building);
        });
      });
    });

    describe('prev building', () => {
      beforeEach(() => {
        building = new Building('foo', {
          row: 5,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        prevBuilding = new Building('foo', {
          row: 5,
          col: 4,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      });

      describe('same dir', () => {
        beforeEach(() => {
          transportItemBehavior.add(prevBuilding);
          transportItemBehavior.add(building);
        });

        it('should set "prev" to next transport building', () => {
          assert.equal(building.prev, prevBuilding);
        });

        it('should set "next" to the building', () => {
          assert.equal(prevBuilding.next, building);
        });

        it('should add the segments together', () => {
          assert.equal(building.segment, prevBuilding.segment);
        });

        it('should update the segment start/end', () => {
          assert.equal(building.segment.start, prevBuilding);
          assert.equal(building.segment.end, building);
        });
      });

      describe('different dir', () => {
        beforeEach(() => {
          prevBuilding.dir = DIRS.up;
          transportItemBehavior.add(prevBuilding);
          transportItemBehavior.add(building);
        });

        it('should not set "prev" to prev transport building', () => {
          assert.notEqual(building.prev, prevBuilding);
        });

        it('should not set "next" to the building', () => {
          assert.notEqual(prevBuilding.next, building);
        });

        it('should not add the segments together', () => {
          assert.notEqual(building.segment, prevBuilding.segment);
        });

        it('should not update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, building);
        });
      });

      describe('not transport building', () => {
        beforeEach(() => {
          prevBuilding.dir = DIRS.up;
          grid.add(prevBuilding);
          transportItemBehavior.add(building);
        });

        it('should not set "prev" to prev transport building', () => {
          assert.notEqual(building.prev, prevBuilding);
        });

        it('should not set "next" to the building', () => {
          assert.notEqual(prevBuilding.next, building);
        });

        it('should not add the segments together', () => {
          assert.notEqual(building.segment, prevBuilding.segment);
        });

        it('should not update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, building);
        });
      });
    });

    describe('side 1 (down) building', () => {
      beforeEach(() => {
        building = new Building('foo', {
          row: 5,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        other2Building = new Building('foo', {
          row: 6,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      });

      describe('dir towards building', () => {
        beforeEach(() => {
          other2Building.dir = DIRS.up;
          transportItemBehavior.add(other2Building);
          transportItemBehavior.add(building);
        });

        it('should not set "prev" to prev transport building', () => {
          assert.notEqual(building.prev, other2Building);
        });

        it('should set "next" to the building', () => {
          assert.equal(other2Building.next, building);
        });

        it('should not add the segments together', () => {
          assert.notEqual(building.segment, other2Building.segment);
        });

        it('should not update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, building);
        });
      });

      describe('dir not towards building', () => {
        beforeEach(() => {
          other2Building.dir = DIRS.down;
          transportItemBehavior.add(other2Building);
          transportItemBehavior.add(building);
        });

        it('should not set "prev" to prev transport building', () => {
          assert.notEqual(building.prev, other2Building);
        });

        it('should not set "next" to the building', () => {
          assert.notEqual(other2Building.next, building);
        });

        it('should not add the segments together', () => {
          assert.notEqual(building.segment, other2Building.segment);
        });

        it('should not update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, building);
        });
      });

      describe('not transport building', () => {
        beforeEach(() => {
          other2Building.dir = DIRS.down;
          grid.add(other2Building);
          transportItemBehavior.add(building);
        });

        it('should not set "prev" to prev transport building', () => {
          assert.notEqual(building.prev, other2Building);
        });

        it('should not set "next" to the building', () => {
          assert.notEqual(other2Building.next, building);
        });

        it('should not add the segments together', () => {
          assert.notEqual(building.segment, other2Building.segment);
        });

        it('should not update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, building);
        });
      });
    });

    describe('side 2 (up) building', () => {
      beforeEach(() => {
        building = new Building('foo', {
          row: 5,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        otherBuilding = new Building('foo', {
          row: 4,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      });

      describe('dir towards building', () => {
        beforeEach(() => {
          otherBuilding.dir = DIRS.down;
          transportItemBehavior.add(otherBuilding);
          transportItemBehavior.add(building);
        });

        it('should not set "prev" to prev transport building', () => {
          assert.notEqual(building.prev, otherBuilding);
        });

        it('should set "next" to the building', () => {
          assert.equal(otherBuilding.next, building);
        });

        it('should not add the segments together', () => {
          assert.notEqual(building.segment, otherBuilding.segment);
        });

        it('should not update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, building);
        });
      });

      describe('dir not towards building', () => {
        beforeEach(() => {
          otherBuilding.dir = DIRS.up;
          transportItemBehavior.add(otherBuilding);
          transportItemBehavior.add(building);
        });

        it('should not set "prev" to prev transport building', () => {
          assert.notEqual(building.prev, otherBuilding);
        });

        it('should not set "next" to the building', () => {
          assert.notEqual(otherBuilding.next, building);
        });

        it('should not add the segments together', () => {
          assert.notEqual(building.segment, otherBuilding.segment);
        });

        it('should not update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, building);
        });
      });

      describe('not transport building', () => {
        beforeEach(() => {
          otherBuilding.dir = DIRS.down;
          grid.add(otherBuilding);
          transportItemBehavior.add(building);
        });

        it('should not set "prev" to prev transport building', () => {
          assert.notEqual(building.prev, otherBuilding);
        });

        it('should not set "next" to the building', () => {
          assert.notEqual(otherBuilding.next, building);
        });

        it('should not add the segments together', () => {
          assert.notEqual(building.segment, otherBuilding.segment);
        });

        it('should not update the segment start/end', () => {
          assert.equal(building.segment.start, building);
          assert.equal(building.segment.end, building);
        });
      });
    });

    describe('next and prev', () => {
      beforeEach(() => {
        building = new Building('foo', {
          row: 5,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        prevBuilding = new Building('foo', {
          row: 5,
          col: 4,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        nextBuilding = new Building('foo', {
          row: 5,
          col: 6,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      });

      describe('same dir', () => {
        beforeEach(() => {
          transportItemBehavior.add(prevBuilding);
          transportItemBehavior.add(nextBuilding);
          assert.lengthOf(_transportSegments, 2);
        });

        it('should set next/prev for all buildings', () => {
          transportItemBehavior.add(building);
          assert.equal(building.next, nextBuilding);
          assert.equal(building.prev, prevBuilding);
          assert.equal(nextBuilding.prev, building);
          assert.equal(prevBuilding.next, building);
        });

        it('should add the segments together', () => {
          transportItemBehavior.add(building);
          assert.equal(building.segment, nextBuilding.segment);
          assert.equal(building.segment, prevBuilding.segment);
        });

        it('should update the segment start/end', () => {
          transportItemBehavior.add(building);
          assert.equal(building.segment.start, prevBuilding);
          assert.equal(building.segment.end, nextBuilding);
        });

        it('should remove segments from _transportSegments', () => {
          transportItemBehavior.add(building);
          assert.deepEqual(_transportSegments, [building.segment]);
        });

        it('should update all segments in the next segment', () => {
          otherBuilding = new Building('foo', {
            row: 5,
            col: 7,
            width: GRID_SIZE,
            height: GRID_SIZE
          });
          transportItemBehavior.add(otherBuilding);
          assert.equal(otherBuilding.segment, nextBuilding.segment);

          transportItemBehavior.add(building);
          assert.equal(building.segment, nextBuilding.segment);
          assert.equal(building.segment, otherBuilding.segment);
        });
      });
    });
  });

  describe('remove', () => {
    it('should remove segment from the building', () => {
      building = new Building('foo', {
        row: 5,
        col: 5,
        width: GRID_SIZE,
        height: GRID_SIZE
      });
      transportItemBehavior.add(building);
      building.behaviors.transportItem[0].remove();
      assert.notExists(building.segment);
    });

    it('should remove the segment from transportSegments', () => {
      building = new Building('foo', {
        row: 5,
        col: 5,
        width: GRID_SIZE,
        height: GRID_SIZE
      });
      transportItemBehavior.add(building);
      building.behaviors.transportItem[0].remove();
      assert.deepEqual(_transportSegments, []);
    });

    it('should do nothing if building was not added before', () => {
      building = new Building('foo', {
        row: 5,
        col: 5,
        width: GRID_SIZE,
        height: GRID_SIZE
      });
    });

    describe('next building', () => {
      beforeEach(() => {
        building = new Building('foo', {
          row: 5,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        nextBuilding = new Building('foo', {
          row: 5,
          col: 6,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      });

      describe('same dir', () => {
        beforeEach(() => {
          transportItemBehavior.add(nextBuilding);
          transportItemBehavior.add(building);
          building.behaviors.transportItem[0].remove();
        });

        it('should remove "next"', () => {
          assert.notExists(building.next);
        });

        it('should remove "prev"', () => {
          assert.notExists(nextBuilding.prev);
        });

        it('should update the segment start/end', () => {
          assert.equal(nextBuilding.segment.start, nextBuilding);
          assert.equal(nextBuilding.segment.end, nextBuilding);
        });
      });

      describe('different dir', () => {
        beforeEach(() => {
          nextBuilding.dir = DIRS.up;
          transportItemBehavior.add(nextBuilding);
          transportItemBehavior.add(building);
          nextBuilding.prev = 2;
          nextBuilding.segment.start = 2;
          nextBuilding.segment.end = 2;
          building.behaviors.transportItem[0].remove();
        });

        it('should not remove "prev', () => {
          assert.equal(nextBuilding.prev, 2);
        });

        it('should not change segment', () => {
          assert.equal(nextBuilding.segment.end, 2);
        });
      });
    });

    describe('prev building', () => {
      beforeEach(() => {
        building = new Building('foo', {
          row: 5,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        prevBuilding = new Building('foo', {
          row: 5,
          col: 4,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      });

      describe('same dir', () => {
        beforeEach(() => {
          transportItemBehavior.add(prevBuilding);
          transportItemBehavior.add(building);
          building.behaviors.transportItem[0].remove();
        });

        it('should remove "next"', () => {
          assert.notExists(prevBuilding.next);
        });

        it('should remove "prev"', () => {
          assert.notExists(building.prev);
        });

        it('should update the segment start/end', () => {
          assert.equal(prevBuilding.segment.start, prevBuilding);
          assert.equal(prevBuilding.segment.end, prevBuilding);
        });
      });

      describe('different dir', () => {
        beforeEach(() => {
          prevBuilding.dir = DIRS.up;
          transportItemBehavior.add(prevBuilding);
          transportItemBehavior.add(building);
          prevBuilding.next = 2;
          prevBuilding.segment.start = 2;
          prevBuilding.segment.end = 2;
          building.behaviors.transportItem[0].remove();
        });

        it('should not remove "next', () => {
          assert.equal(prevBuilding.next, 2);
        });

        it('should not change segment', () => {
          assert.equal(prevBuilding.segment.start, 2);
        });
      });
    });

    describe('side 1 (down) building', () => {
      beforeEach(() => {
        building = new Building('foo', {
          row: 5,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        other2Building = new Building('foo', {
          row: 6,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      });

      describe('dir towards building', () => {
        beforeEach(() => {
          other2Building.dir = DIRS.up;
          transportItemBehavior.add(other2Building);
          transportItemBehavior.add(building);
          other2Building.segment.start = 2;
          other2Building.segment.end = 2;
          building.behaviors.transportItem[0].remove();
        });

        it('should remove "next"', () => {
          assert.notExists(other2Building.next);
        });

        it('should not change segment', () => {
          assert.equal(other2Building.segment.end, 2);
        });
      });

      describe('dir not towards building', () => {
        beforeEach(() => {
          other2Building.dir = DIRS.down;
          transportItemBehavior.add(other2Building);
          transportItemBehavior.add(building);
          other2Building.next = 2;
          other2Building.segment.start = 2;
          other2Building.segment.end = 2;
          building.behaviors.transportItem[0].remove();
        });

        it('should not remove "next', () => {
          assert.equal(other2Building.next, 2);
        });

        it('should not change segment', () => {
          assert.equal(other2Building.segment.end, 2);
        });
      });
    });

    describe('side 2 (up) building', () => {
      beforeEach(() => {
        building = new Building('foo', {
          row: 5,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        otherBuilding = new Building('foo', {
          row: 4,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      });

      describe('dir towards building', () => {
        beforeEach(() => {
          otherBuilding.dir = DIRS.down;
          transportItemBehavior.add(otherBuilding);
          transportItemBehavior.add(building);
          otherBuilding.segment.start = 2;
          otherBuilding.segment.end = 2;
          building.behaviors.transportItem[0].remove();
        });

        it('should remove "next"', () => {
          assert.notExists(otherBuilding.next);
        });

        it('should not change segment', () => {
          assert.equal(otherBuilding.segment.end, 2);
        });
      });

      describe('dir not towards building', () => {
        beforeEach(() => {
          otherBuilding.dir = DIRS.up;
          transportItemBehavior.add(otherBuilding);
          transportItemBehavior.add(building);
          otherBuilding.prev = 2;
          otherBuilding.segment.start = 2;
          otherBuilding.segment.end = 2;
          building.behaviors.transportItem[0].remove();
        });

        it('should not remove "prev', () => {
          assert.equal(otherBuilding.prev, 2);
        });

        it('should not change segment', () => {
          assert.equal(otherBuilding.segment.start, 2);
        });
      });
    });

    describe('next and prev', () => {
      beforeEach(() => {
        building = new Building('foo', {
          row: 5,
          col: 5,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        prevBuilding = new Building('foo', {
          row: 5,
          col: 4,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
        nextBuilding = new Building('foo', {
          row: 5,
          col: 6,
          width: GRID_SIZE,
          height: GRID_SIZE
        });
      });

      describe('same dir', () => {
        beforeEach(() => {
          transportItemBehavior.add(prevBuilding);
          transportItemBehavior.add(nextBuilding);
        });

        it('should remove next/prev for all buildings', () => {
          transportItemBehavior.add(building);
          building.behaviors.transportItem[0].remove();
          assert.notExists(building.next);
          assert.notExists(building.prev);
          assert.notExists(nextBuilding.prev);
          assert.notExists(prevBuilding.next);
        });

        it('should split the segments', () => {
          transportItemBehavior.add(building);
          building.behaviors.transportItem[0].remove();
          assert.notEqual(prevBuilding.segment, nextBuilding.segment);
        });

        it('should update the segment start/end', () => {
          transportItemBehavior.add(building);
          building.behaviors.transportItem[0].remove();
          assert.equal(prevBuilding.segment.end, prevBuilding);
          assert.equal(nextBuilding.segment.start, nextBuilding);
        });

        it('should remove segments from _transportSegments', () => {
          transportItemBehavior.add(building);
          building.behaviors.transportItem[0].remove();
          assert.deepEqual(_transportSegments, [
            prevBuilding.segment,
            nextBuilding.segment
          ]);
        });

        it('should update all segments in next/prev segment', () => {
          otherBuilding = new Building('foo', {
            row: 5,
            col: 7,
            width: GRID_SIZE,
            height: GRID_SIZE
          });
          other2Building = new Building('foo', {
            row: 5,
            col: 3,
            width: GRID_SIZE,
            height: GRID_SIZE
          });
          transportItemBehavior.add(otherBuilding);
          transportItemBehavior.add(other2Building);
          assert.equal(otherBuilding.segment, nextBuilding.segment);
          assert.equal(other2Building.segment, prevBuilding.segment);
          assert.notEqual(prevBuilding.segment, nextBuilding.segment);

          transportItemBehavior.add(building);
          assert.equal(prevBuilding.segment, nextBuilding.segment);
          assert.deepEqual(_transportSegments, [building.segment]);

          building.behaviors.transportItem[0].remove();
          assert.notEqual(prevBuilding.segment, nextBuilding.segment);
          assert.equal(other2Building.segment.end, prevBuilding);
          assert.equal(otherBuilding.segment.start, nextBuilding);
          assert.deepEqual(_transportSegments, [
            prevBuilding.segment,
            nextBuilding.segment
          ]);
        });
      });
    });
  });

  describe('behavior', () => {});
});
