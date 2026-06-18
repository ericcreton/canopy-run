export class SoundSystem {
  enabled = true;
  private context?: AudioContext;
  unlock() {
    try {
      this.context ??= new AudioContext();
      void this.context.resume();
    } catch {
      /* Audio is optional. */
    }
  }
  play(type: "grab" | "release" | "banana" | "death") {
    if (!this.enabled || !this.context) return;
    const ctx = this.context,
      osc = ctx.createOscillator(),
      gain = ctx.createGain();
    const frequencies = { grab: 180, release: 300, banana: 880, death: 120 };
    osc.type = type === "banana" ? "sine" : "triangle";
    osc.frequency.setValueAtTime(frequencies[type], ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      type === "banana" ? 1400 : 60,
      ctx.currentTime + 0.16,
    );
    gain.gain.setValueAtTime(0.045, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.21);
  }
}
