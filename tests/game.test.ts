import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { physics } from "../src/config/gameConfig";
import {
  selectSwingPoint,
  seededRandom,
  nextPoint,
} from "../src/systems/rules";
import { ScoreSystem } from "../src/systems/ScoreSystem";
import { SwingSystem } from "../src/systems/SwingSystem";
import { LevelGenerator } from "../src/systems/LevelGenerator";
const require = createRequire(import.meta.url);
const M = require("phaser/src/physics/matter-js/CustomMain.js");
function fixture(x = 180, y = 350) {
  const engine = M.Engine.create({
    gravity: { x: 0, y: physics.gravity },
    positionIterations: 10,
    velocityIterations: 8,
    constraintIterations: 6,
  });
  const body = M.Bodies.circle(x, y, 19, { frictionAir: physics.airDrag });
  M.Composite.add(engine.world, body);
  M.Body.setVelocity(body, { x: 8.5, y: 0 });
  const graphics = {
    setDepth() {
      return this;
    },
    clear() {
      return this;
    },
    destroy() {},
    lineStyle() {
      return this;
    },
    lineBetween() {
      return this;
    },
  };
  const scene = {
    add: { graphics: () => graphics },
    matter: {
      body: M.Body,
      add: {
        worldConstraint: (
          body: any,
          length: number,
          stiffness: number,
          options: any,
        ) => {
          const c = M.Constraint.create({
            bodyB: body,
            length,
            stiffness,
            ...options,
          });
          M.Composite.add(engine.world, c);
          return c;
        },
      },
      world: {
        removeConstraint: (c: any) => M.Composite.remove(engine.world, c),
      },
    },
  };
  const monkey = {
    body: {
      get x() {
        return body.position.x;
      },
      get y() {
        return body.position.y;
      },
      body,
    },
  };
  const swing = new SwingSystem(scene as any, monkey as any);
  return { engine, body, swing, monkey };
}
test("selection rejects distant, low, and just-released points", () => {
  assert.equal(
    selectSwingPoint({ x: 0, y: 300 }, [{ id: 1, x: 291, y: 200 }], null),
    undefined,
  );
  assert.equal(
    selectSwingPoint({ x: 0, y: 300 }, [{ id: 1, x: 80, y: 320 }], null),
    undefined,
  );
  assert.equal(
    selectSwingPoint({ x: 0, y: 300 }, [{ id: 1, x: 80, y: 100 }], 1),
    undefined,
  );
  assert.equal(
    selectSwingPoint(
      { x: 0, y: 300 },
      [
        { id: 1, x: -40, y: 100 },
        { id: 2, x: 100, y: 100 },
      ],
      null,
    )?.id,
    2,
  );
});
test("attachment preserves position and velocity; holding creates only one constraint", () => {
  const { swing, body, engine } = fixture();
  const velocity = { ...body.velocity },
    position = { ...body.position };
  assert.ok(swing.grab([{ id: 1, x: 330, y: 165 }], 0));
  assert.deepEqual(body.position, position);
  assert.deepEqual(body.velocity, velocity);
  for (let i = 0; i < 100; i++)
    assert.equal(swing.grab([{ id: 1, x: 330, y: 165 }], i * 16), false);
  assert.equal(M.Composite.allConstraints(engine.world).length, 1);
});
test("bottom-of-swing release preserves forward velocity and removes constraint", () => {
  const { swing, body, engine } = fixture(329, 380);
  swing.grab([{ id: 1, x: 330, y: 165 }], 0);
  M.Body.setVelocity(body, { x: 12, y: 0 });
  M.Engine.update(engine, 1000 / 60);
  const before = { ...body.velocity };
  assert.ok(swing.release(200));
  assert.deepEqual(body.velocity, before);
  assert.ok(body.velocity.x > 11);
  assert.equal(M.Composite.allConstraints(engine.world).length, 0);
  assert.equal(swing.release(201), false);
});
test("cooldown prevents immediate reattachment and new branch keeps momentum", () => {
  const { swing, body } = fixture();
  swing.grab([{ id: 1, x: 330, y: 165 }], 0);
  swing.release(200);
  assert.equal(swing.grab([{ id: 2, x: 350, y: 165 }], 220), false);
  const before = { ...body.velocity };
  assert.ok(swing.grab([{ id: 2, x: 350, y: 165 }], 320));
  assert.deepEqual(body.velocity, before);
});
test("rope remains stable at configured maximum velocity for 600 frames", () => {
  const { swing, body, engine } = fixture();
  swing.grab([{ id: 1, x: 330, y: 165 }], 0);
  M.Body.setVelocity(body, { x: physics.maxVelocity, y: 0 });
  const length = swing.constraint!.length;
  for (let i = 0; i < 600; i++) {
    M.Engine.update(engine, 1000 / 60);
    assert.ok(Number.isFinite(body.position.x));
    assert.ok(
      Math.abs(
        Math.hypot(body.position.x - 330, body.position.y - 165) - length,
      ) < 5,
    );
  }
});
test("seeded layout has capped reachable spacing over 10,000 branches", () => {
  const random = seededRandom(42),
    other = seededRandom(42);
  let a = { id: 0, x: 330, y: 165 },
    b = { ...a };
  for (let i = 0; i < 10000; i++) {
    const next = nextPoint(a, random);
    b = nextPoint(b, other);
    assert.deepEqual(next, b);
    assert.ok(Math.hypot(next.x - a.x, next.y - a.y) < 230);
    assert.ok(next.y >= 140 && next.y <= 240);
    a = next;
  }
});
test("endless generation disposes old objects and bounds live object counts", () => {
  let destroyed = 0;
  const image = () => ({
    setOrigin() {
      return this;
    },
    setDepth() {
      return this;
    },
    setRotation() {
      return this;
    },
    destroy() {
      destroyed++;
    },
  });
  const level = new LevelGenerator({
    add: { image },
    tweens: { add() {} },
  } as any);
  for (let x = 180; x < 100000; x += 100) {
    level.update(x);
    assert.ok(level.points.length < 20);
    assert.ok(level.bananas.length < 60);
    assert.ok(level.points.every((p) => p.x >= x - 650));
  }
  assert.ok(destroyed > 1000);
});
test("score tracks distance, grabs and fresh runs reset all values", () => {
  const score = new ScoreSystem();
  score.update(1180, 10, 1000);
  score.bananas = 2;
  score.grab(1);
  score.grab(2);
  assert.equal(score.score, 150);
  assert.equal(score.longestChain, 2);
  assert.equal(score.maxSpeed, 60);
  assert.equal(score.duration, 1);
  const fresh = new ScoreSystem();
  assert.equal(fresh.score, 0);
  assert.equal(fresh.grabs, 0);
  assert.equal(fresh.duration, 0);
});
test("free fall crosses death threshold", () => {
  const { engine, body } = fixture();
  for (let i = 0; i < 150; i++) M.Engine.update(engine, 1000 / 60);
  assert.ok(body.position.y > physics.deathY);
});

test("timed releases traverse a sustained sequence of seeded branches", () => {
  const { engine, body, swing, monkey } = fixture();
  const random = seededRandom(42);
  const points = [{ id: 0, x: 330, y: 165 }];
  for (let i = 0; i < 200; i++) points.push(nextPoint(points.at(-1)!, random));
  let grabs = 0;
  for (let frame = 0; frame < 1800; frame++) {
    const now = (frame * 1000) / 60;
    if (
      swing.anchor &&
      body.position.x > swing.anchor.x + swing.constraint!.length * 0.3 &&
      body.velocity.x > 0
    )
      swing.release(now);
    if (!swing.constraint && body.position.y > 330 && swing.grab(points, now))
      grabs++;
    swing.updatePhysics();
    M.Engine.update(engine, 1000 / 60);
    const speed = Math.hypot(body.velocity.x, body.velocity.y);
    if (speed > physics.maxVelocity)
      M.Body.setVelocity(body, {
        x: (body.velocity.x / speed) * physics.maxVelocity,
        y: (body.velocity.y / speed) * physics.maxVelocity,
      });
    if (body.position.y > physics.deathY) break;
  }
  assert.ok(
    grabs >= 15,
    `Only ${grabs} grabs; final position ${JSON.stringify(body.position)}`,
  );
  assert.ok(monkey.body.x > 3000);
});
