import type Phaser from "phaser";
import { hazards, world } from "../config/gameConfig";
import type { Point } from "./rules";
import {
  hazardForBranch,
  hazardPosition,
  sweptHit,
  type HazardSpec,
  type Position,
} from "./hazardRules";
interface Hazard {
  spec: HazardSpec;
  position: Position;
  visual: Phaser.GameObjects.Image;
}
export class HazardSystem {
  private objects: Hazard[] = [];
  private latestBranch = -1;
  private elapsed = 0;
  private previousPlayer: Position = { x: 180, y: 350 };
  constructor(private scene: Phaser.Scene) {}
  get count() {
    return this.objects.length;
  }
  populate(points: Point[], playerX: number) {
    for (const point of points) {
      if (point.id <= this.latestBranch) continue;
      this.latestBranch = point.id;
      const spec = hazardForBranch(point);
      if (!spec) continue;
      const position = hazardPosition(spec, this.elapsed);
      this.objects.push({
        spec,
        position,
        visual: this.scene.add
          .image(position.x, position.y, spec.kind)
          .setDepth(8),
      });
    }
    this.objects = this.objects.filter((h) => {
      if (h.spec.x < playerX - world.behind) {
        h.visual.destroy();
        return false;
      }
      return true;
    });
  }
  update(player: Position, delta: number): HazardSpec["kind"] | undefined {
    this.elapsed += delta / 1000;
    let hit: HazardSpec["kind"] | undefined;
    for (const hazard of this.objects) {
      const next = hazardPosition(hazard.spec, this.elapsed);
      if (
        sweptHit(
          this.previousPlayer,
          player,
          hazard.position,
          next,
          hazard.spec.radius + hazards.playerRadius,
        )
      )
        hit = hazard.spec.kind;
      hazard.position = next;
      hazard.visual.setPosition(next.x, next.y);
      if (hazard.spec.kind === "hornet") {
        hazard.visual.setRotation(
          Math.sin(this.elapsed * 12 + hazard.spec.phase) * 0.09,
        );
        hazard.visual.setScale(1, 1 + Math.sin(this.elapsed * 28) * 0.045);
      }
    }
    this.previousPlayer = { x: player.x, y: player.y };
    return hit;
  }
  destroy() {
    this.objects.forEach((h) => h.visual.destroy());
    this.objects = [];
  }
}
