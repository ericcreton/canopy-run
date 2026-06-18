import type Phaser from "phaser";
import { world } from "../config/gameConfig";
import { nextPoint, seededRandom, type Point } from "./rules";
interface Branch extends Point {
  visual: Phaser.GameObjects.Image;
}
interface Banana {
  x: number;
  y: number;
  visual: Phaser.GameObjects.Image;
}
export class LevelGenerator {
  points: Branch[] = [];
  bananas: Banana[] = [];
  private random = seededRandom(world.seed);
  private last: Point = { id: 0, x: 330, y: 165 };
  constructor(private scene: Phaser.Scene) {
    this.add(this.last);
    this.update(180);
  }
  private add(point: Point) {
    this.points.push({
      ...point,
      visual: this.scene.add
        .image(point.x, point.y, "branch")
        .setOrigin(0.5, 0.82)
        .setDepth(5),
    });
    for (let i = 0; i < 3; i++) {
      const x = point.x - 65 + i * 35,
        y = point.y + 190 + Math.sin(i * 1.3) * 20;
      this.bananas.push({
        x,
        y,
        visual: this.scene.add
          .image(x, y, "banana")
          .setDepth(7)
          .setRotation(0.15 * (i - 1)),
      });
    }
  }
  update(x: number) {
    while (this.last.x < x + world.ahead) {
      this.last = nextPoint(this.last, this.random);
      this.add(this.last);
    }
    this.points = this.points.filter((p) => {
      if (p.x < x - world.behind) {
        p.visual.destroy();
        return false;
      }
      return true;
    });
    this.bananas = this.bananas.filter((p) => {
      if (p.x < x - world.behind) {
        p.visual.destroy();
        return false;
      }
      return true;
    });
  }
  collect(x: number, y: number) {
    let count = 0;
    this.bananas = this.bananas.filter((b) => {
      if (Math.hypot(b.x - x, b.y - y) < 37) {
        count++;
        this.scene.tweens.add({
          targets: b.visual,
          y: b.y - 45,
          alpha: 0,
          scale: 1.6,
          duration: 250,
          onComplete: () => b.visual.destroy(),
        });
        return false;
      }
      return true;
    });
    return count;
  }
}
