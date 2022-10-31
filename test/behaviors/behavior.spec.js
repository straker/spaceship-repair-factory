import Behavior from '../../src/behaviors/behavior.js';
import Building from '../../src/building.js';
import { buildings } from '../../src/data/buildings.js';

describe('behavior', () => {
  let behavior = new Behavior('foo');
  let building;

  beforeEach(() => {
    buildings.foo = {
      behaviors: []
    };
  });

  afterEach(() => {
    if (building) {
      building.destroy();
      building = null;
    }

    behavior.buildings = [];

    if (behavior._behavior.restore) {
      behavior._behavior.restore();
    }

    delete buildings.foo;
  });

  describe('constructor', () => {
    it('should set the name of the behavior', () => {
      assert.equal(behavior.name, 'foo');
    });

    it('should create buildings array', () => {
      assert.typeOf(behavior.buildings, 'array');
    });
  });

  describe('add', () => {
    it('should create the behavior on the building', () => {
      const building = new Building('foo');
      behavior.add(building);
      assert.exists(building.behaviors.foo);
    });

    it('should set behavior options', () => {
      const building = new Building('foo');
      behavior.add(building, { foo: 1 });
      assert.equal(building.behaviors.foo[0].foo, 1);
    });

    it('should add building to buildings array', () => {
      const building = new Building('foo');
      behavior.add(building);
      assert.deepEqual(behavior.buildings, [building]);
    });

    it('should allow only one behavior', () => {
      const building = new Building('foo');
      behavior.add(building, { foo: 1 });
      behavior.add(building, { bar: 2 });
      assert.lengthOf(building.behaviors.foo, 1);
      assert.equal(building.behaviors.foo[0].bar, 2);
    });

    it('should allow multiple behaviors with option', () => {
      const building = new Building('foo');
      behavior.add(building, { foo: 1, allowMultiple: true });
      behavior.add(building, { bar: 2, allowMultiple: true });
      assert.lengthOf(building.behaviors.foo, 2);
      assert.equal(building.behaviors.foo[0].foo, 1);
      assert.equal(building.behaviors.foo[1].bar, 2);
    });

    it('should allow removing behavior from building', () => {
      const building = new Building('foo');
      behavior.add(building);
      building.behaviors.foo[0].remove();
      assert.lengthOf(building.behaviors.foo, 0);
    });

    it('should remove correct behavior', () => {
      const building = new Building('foo');
      behavior.add(building, { foo: 1, allowMultiple: true });
      behavior.add(building, { bar: 2, allowMultiple: true });
      building.behaviors.foo[0].remove();
      assert.lengthOf(building.behaviors.foo, 1);
      assert.equal(building.behaviors.foo[0].bar, 2);
    });

    it('should remove building from buildings array', () => {
      const building = new Building('foo');
      behavior.add(building);
      building.behaviors.foo[0].remove();
      assert.lengthOf(behavior.buildings, 0);
    });

    it('should not remove building from buildings array if still has behavior', () => {
      const building = new Building('foo');
      behavior.add(building, { foo: 1, allowMultiple: true });
      behavior.add(building, { bar: 2, allowMultiple: true });
      building.behaviors.foo[0].remove();
      assert.lengthOf(behavior.buildings, 1);
    });
  });

  describe('run', () => {
    it('should call the behavior for a building', () => {
      const building = new Building('foo');
      behavior.add(building);
      const spy = sinon.spy(behavior, '_behavior');
      behavior.run(0.2);
      assert.isTrue(spy.calledWith(building, 0.2));
    });

    it('should call the behavior for each building', () => {
      const building = new Building('foo');
      const otherBuilding = new Building('foo');
      behavior.add(building);
      behavior.add(otherBuilding);
      const spy = sinon.spy(behavior, '_behavior');
      behavior.run(0.2);

      assert.isTrue(spy.calledWith(building, 0.2));
      assert.isTrue(spy.calledWith(otherBuilding, 0.2));
    });
  });
});
