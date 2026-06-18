export class ScoreSystem {
  distance = 0;
  maxSpeed = 0;
  bananas = 0;
  grabs = 0;
  chain = 0;
  longestChain = 0;
  duration = 0;
  lastAnchor = -1;
  get score() {
    return Math.floor(this.distance) + this.bananas * 25;
  }
  update(x: number, speed: number, delta: number) {
    this.distance = Math.max(this.distance, (x - 180) / 10);
    this.maxSpeed = Math.max(this.maxSpeed, speed * 6);
    this.duration += delta / 1000;
  }
  grab(id: number) {
    this.grabs++;
    if (id > this.lastAnchor) {
      this.chain++;
      this.longestChain = Math.max(this.chain, this.longestChain);
    } else this.chain = 1;
    this.lastAnchor = id;
  }
}
