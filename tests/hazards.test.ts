import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hazardForBranch,
  hazardPosition,
  sweptHit,
} from "../src/systems/hazardRules";
import { HazardSystem } from "../src/systems/HazardSystem";
import { hazards } from "../src/config/gameConfig";
const point = (id: number) => ({ id, x: 330 + id * 180, y: 180 });
test("hazards leave an opening and alternate separated high and low lanes", () => {
  for (let id = 0; id < 4; id++)
    assert.equal(hazardForBranch(point(id)), undefined);
  const first = hazardForBranch(point(4))!,
    second = hazardForBranch(point(8))!;
  assert.equal(first.kind, "hornet");
  assert.equal(second.kind, "thorns");
  assert.ok(second.x - first.x >= 700);
  for (let t = 0; t < 20; t += 0.1) {
    const top =
      hazardPosition(first, t).y + first.radius + hazards.playerRadius;
    const bottom = second.y - second.radius - hazards.playerRadius;
    assert.ok(bottom - top > 60);
  }
  assert.deepEqual(first, hazardForBranch(point(4)));
});
test("swept collision catches high-speed crossings and moving enemies", () => {
  assert.ok(
    sweptHit(
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 0 },
      30,
    ),
  );
  assert.ok(
    sweptHit(
      { x: 100, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      30,
    ),
  );
  assert.ok(
    !sweptHit(
      { x: 0, y: 50 },
      { x: 200, y: 50 },
      { x: 100, y: 0 },
      { x: 100, y: 0 },
      30,
    ),
  );
  assert.ok(
    sweptHit(
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 0 },
      30,
    ),
  );
  assert.ok(
    !sweptHit(
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 40, y: 0 },
      { x: 40, y: 0 },
      30,
    ),
  );
});
function fixture() {
  let created = 0,
    destroyed = 0;
  const image = () => {
    created++;
    return {
      setDepth() {
        return this;
      },
      setPosition() {
        return this;
      },
      setRotation() {
        return this;
      },
      setScale() {
        return this;
      },
      destroy() {
        destroyed++;
      },
    };
  };
  return {
    system: new HazardSystem({ add: { image } } as any),
    counts: () => ({ created, destroyed }),
  };
}
test("population does not duplicate enemies and long runs clean up old hazards", () => {
  const { system, counts } = fixture();
  for (let id = 0; id < 1000; id++) {
    const points = Array.from({ length: 10 }, (_, i) => point(id + i));
    system.populate(points, point(id).x);
    system.populate(points, point(id).x);
    assert.ok(system.count <= 5);
  }
  assert.ok(counts().destroyed > 240);
  assert.equal(counts().created - counts().destroyed, system.count);
  system.destroy();
  assert.equal(system.count, 0);
  assert.equal(counts().created, counts().destroyed);
});
test("hazard hits return the right death cause and a new run resets state", () => {
  const { system } = fixture();
  const p = point(4),
    spec = hazardForBranch(p)!,
    position = hazardPosition(spec, 0);
  system.populate([p], 180);
  assert.equal(system.update(position, 0), "hornet");
  system.destroy();
  const fresh = fixture().system;
  assert.equal(fresh.count, 0);
  fresh.populate([p], 180);
  assert.equal(fresh.count, 1);
  assert.equal(fresh.update({ x: 180, y: 350 }, 0), undefined);
});
