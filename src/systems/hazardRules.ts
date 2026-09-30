import { hazards } from "../config/gameConfig";
import type { Point } from "./rules";
export interface Position {
  x: number;
  y: number;
}
export interface HazardSpec extends Position {
  id: number;
  kind: "hornet" | "thorns";
  radius: number;
  phase: number;
}
// Keep the opening forgiving and leave several unobstructed branches between hazards.
export function hazardForBranch(point: Point): HazardSpec | undefined {
  if (point.id < hazards.firstBranch || point.id % hazards.branchInterval !== 0)
    return;
  const kind =
    (point.id / hazards.branchInterval) % 2 === 1 ? "hornet" : "thorns";
  return {
    id: point.id,
    kind,
    x: point.x + 75,
    y: point.y + (kind === "hornet" ? 110 : 280),
    radius: kind === "hornet" ? 19 : 24,
    phase: point.id * 1.7,
  };
}
export function hazardPosition(spec: HazardSpec, seconds: number): Position {
  return {
    x: spec.x,
    y:
      spec.y +
      (spec.kind === "hornet"
        ? Math.sin(seconds * 2.2 + spec.phase) * hazards.patrolHeight
        : 0),
  };
}
// Sweep in relative coordinates so fast players cannot tunnel through a moving enemy.
export function sweptHit(
  from: Position,
  to: Position,
  enemyFrom: Position,
  enemyTo: Position,
  radius: number,
): boolean {
  const x = from.x - enemyFrom.x,
    y = from.y - enemyFrom.y;
  const dx = to.x - enemyTo.x - x,
    dy = to.y - enemyTo.y - y;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, -(x * dx + y * dy) / lengthSquared));
  return Math.hypot(x + dx * t, y + dy * t) <= radius;
}
