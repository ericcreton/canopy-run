import Phaser from "phaser";
import { MonkeyArms } from "./MonkeyArms";
import { physics } from "../config/gameConfig";
export class Monkey {
  body: Phaser.Physics.Matter.Image;
  arms: MonkeyArms;
  constructor(scene: Phaser.Scene) {
    this.body = scene.matter.add
      .image(180, 350, "monkey")
      .setCircle(19)
      .setFrictionAir(physics.airDrag)
      .setBounce(0.1)
      .setIgnoreGravity(false);
    this.body.setFixedRotation();
    this.body.setVelocity(0, 0);
    this.body.setDepth(10);
    this.arms = new MonkeyArms(scene);
    this.animate(0);
  }
  animate(delta: number, anchor?: { x: number; y: number }) {
    this.arms.draw(
      this.body,
      (this.body.body as MatterJS.BodyType).velocity,
      delta,
      anchor,
    );
  }
  update() {
    const velocity = (this.body.body as MatterJS.BodyType).velocity;
    const speed = Math.hypot(velocity.x, velocity.y);
    if (speed > physics.maxVelocity)
      this.body.setVelocity(
        (velocity.x / speed) * physics.maxVelocity,
        (velocity.y / speed) * physics.maxVelocity,
      );
    this.body.rotation = Phaser.Math.Clamp(velocity.y * 0.035, -0.65, 0.8);
    return Math.min(speed, physics.maxVelocity);
  }
}
