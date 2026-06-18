import Phaser from "phaser";
import { physics } from "../config/gameConfig";
export class Monkey {
  body: Phaser.Physics.Matter.Image;
  constructor(scene: Phaser.Scene) {
    this.body = scene.matter.add
      .image(180, 350, "monkey")
      .setCircle(19)
      .setFrictionAir(physics.airDrag)
      .setBounce(0.1)
      .setIgnoreGravity(false);
    this.body.setFixedRotation();
    this.body.setVelocity(physics.initialVelocity, 0);
    this.body.setDepth(10);
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
