import { physics, world } from "../config/gameConfig";
export interface Point {
  x: number;
  y: number;
  id: number;
}
export function selectSwingPoint(
  player: { x: number; y: number },
  points: Point[],
  excluded: number | null,
): Point | undefined {
  return points
    .filter(
      (p) =>
        p.id !== excluded &&
        p.y < player.y - 20 &&
        p.x > player.x - 90 &&
        Math.hypot(p.x - player.x, p.y - player.y) <= physics.grabRadius &&
        Math.hypot(p.x - player.x, p.y - player.y) >= physics.minRopeLength,
    )
    .sort((a, b) => rank(a) - rank(b))[0];
  function rank(p: Point) {
    return (
      Math.hypot(p.x - player.x, p.y - player.y) +
      (p.x < player.x ? 170 : 0) -
      Math.min(100, p.x - player.x) * 0.4
    );
  }
}
export function seededRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function nextPoint(previous: Point, random: () => number): Point {
  const difficulty = Math.min(1, previous.x / 22000),
    gap =
      world.baseGap + random() * (world.maxGap - world.baseGap) * difficulty;
  return {
    id: previous.id + 1,
    x: previous.x + gap,
    y: Math.max(
      140,
      Math.min(240, previous.y + (random() - 0.5) * (35 + 35 * difficulty)),
    ),
  };
}
