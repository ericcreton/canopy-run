import type Phaser from "phaser";
import { physics } from "../config/gameConfig";
import { selectSwingPoint, type Point } from "./rules";
import type { Monkey } from "../entities/Monkey";
export class SwingSystem {
  constraint?: MatterJS.ConstraintType;
  anchor?: Point;
  lastAnchor: number | null = null;
  private nextGrab = 0;
  private rope: Phaser.GameObjects.Graphics;
  constructor(
    private scene: Phaser.Scene,
    private monkey: Monkey,
  ) {
    this.rope = scene.add.graphics().setDepth(9);
  }
  grab(points: Point[], now: number) {
    if (this.constraint || now < this.nextGrab) return false;
    const body = this.monkey.body;
    const anchor = selectSwingPoint(body, points, this.lastAnchor);
    if (!anchor) return false;
    // Create at the current distance: no positional jump or velocity reset on attachment.
    this.anchor = anchor;
    this.constraint = this.scene.matter.add.worldConstraint(
      body.body as MatterJS.BodyType,
      Math.min(
        physics.maxRopeLength,
        Math.hypot(body.x - anchor.x, body.y - anchor.y),
      ),
      0.96,
      { pointA: { x: anchor.x, y: anchor.y }, damping: physics.swingDamping },
    );
    this.nextGrab = now + physics.grabCooldown;
    return true;
  }
  release(now: number) {
    if (!this.constraint) return false;
    this.scene.matter.world.removeConstraint(this.constraint);
    this.lastAnchor = this.anchor?.id ?? null;
    this.constraint = undefined;
    this.anchor = undefined;
    this.nextGrab = now + physics.releaseCooldown;
    this.rope.clear();
    return true;
  }
  updatePhysics() {
    if (!this.anchor) return;
    const body = this.monkey.body.body as MatterJS.BodyType;
    const dx = body.position.x - this.anchor.x;
    const dy = body.position.y - this.anchor.y;
    const length = Math.hypot(dx, dy);
    // A small tangential pump offsets energy lost on catches. Gravity still
    // controls the arc; the assist never pushes through a backward swing.
    if (
      dy > 0 &&
      body.velocity.x > 0 &&
      Math.hypot(body.velocity.x, body.velocity.y) < physics.assistSpeedLimit
    ) {
      this.scene.matter.body.applyForce(body, body.position, {
        x: (dy / length) * physics.swingAssist,
        y: (-dx / length) * physics.swingAssist,
      });
    }
  }
  draw() {
    this.rope.clear();
    if (this.anchor) {
      this.rope
        .lineStyle(4, 0x263f27, 0.5)
        .lineBetween(
          this.anchor.x + 2,
          this.anchor.y,
          this.monkey.body.x + 2,
          this.monkey.body.y - 8,
        );
      this.rope
        .lineStyle(2.5, 0xe0d49b)
        .lineBetween(
          this.anchor.x,
          this.anchor.y,
          this.monkey.body.x,
          this.monkey.body.y - 8,
        );
    }
  }
  destroy() {
    this.release(0);
    this.rope.destroy();
  }
}
