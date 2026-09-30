import type Phaser from "phaser";
interface Position {
  x: number;
  y: number;
}

/** Cosmetic limbs only: the Matter body and grab radius stay unchanged. */
export class MonkeyArms {
  private arms: Phaser.GameObjects.Graphics;
  private hands: Phaser.GameObjects.Graphics;
  private time = 0;
  private tips: Position[] = [
    { x: -38, y: -15 },
    { x: 38, y: -15 },
  ];
  grip: Position = { x: 0, y: -44 };
  constructor(scene: Phaser.Scene) {
    this.arms = scene.add.graphics().setDepth(9.5);
    this.hands = scene.add.graphics().setDepth(11);
  }
  draw(
    body: Position & { rotation: number },
    velocity: Position,
    delta: number,
    anchor?: Position,
  ) {
    this.time += Math.min(delta, 50) / 1000;
    const angle = anchor
      ? Math.atan2(anchor.y - body.y, anchor.x - body.x)
      : -Math.PI / 2;
    this.grip = {
      x: body.x + Math.cos(angle) * 46,
      y: body.y + Math.sin(angle) * 46,
    };
    this.arms.clear();
    this.hands.clear();
    const blend = 1 - Math.exp(-Math.min(delta, 50) / 65);
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const shoulder = {
        x: body.x + side * 12 * Math.cos(body.rotation),
        y: body.y + side * 12 * Math.sin(body.rotation),
      };
      const wave = this.time * 7 + i * 2.1;
      const target = anchor
        ? {
            x: this.grip.x - body.x + side * 4,
            y: this.grip.y - body.y + side * 3,
          }
        : {
            x: side * (38 + Math.sin(wave) * 11) - velocity.x * 0.8,
            y: -10 + Math.cos(wave * 0.8) * 22 - velocity.y * 0.7,
          };
      this.tips[i].x += (target.x - this.tips[i].x) * blend;
      this.tips[i].y += (target.y - this.tips[i].y) * blend;
      const tip = { x: body.x + this.tips[i].x, y: body.y + this.tips[i].y };
      // Two bowed control points make the long arms flex like soft noodles.
      const curl = side * (anchor ? 20 : 24 + Math.sin(wave) * 9);
      const c1 = { x: shoulder.x + curl, y: shoulder.y + 19 };
      const c2 = { x: tip.x + curl, y: tip.y + 20 };
      for (const [width, color] of [
        [10, 0x623d2a],
        [7, 0x9b643d],
      ]) {
        this.arms.lineStyle(width, color, 1);
        this.arms.beginPath();
        this.arms.moveTo(shoulder.x, shoulder.y);
        for (let step = 1; step <= 16; step++) {
          const t = step / 16,
            u = 1 - t;
          this.arms.lineTo(
            u * u * u * shoulder.x +
              3 * u * u * t * c1.x +
              3 * u * t * t * c2.x +
              t * t * t * tip.x,
            u * u * u * shoulder.y +
              3 * u * u * t * c1.y +
              3 * u * t * t * c2.y +
              t * t * t * tip.y,
          );
        }
        this.arms.strokePath();
      }
      this.hands.fillStyle(0x623d2a).fillCircle(tip.x, tip.y, 6.5);
      this.hands.fillStyle(0xe5b878).fillCircle(tip.x, tip.y, 4.5);
      this.hands.fillCircle(tip.x + side * 4, tip.y - 3, 2.5);
    }
    // The visible vine ends between the hands during their reaching transition.
    this.grip = {
      x: body.x + (this.tips[0].x + this.tips[1].x) / 2,
      y: body.y + (this.tips[0].y + this.tips[1].y) / 2,
    };
  }
}
