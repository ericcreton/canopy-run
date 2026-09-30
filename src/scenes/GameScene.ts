import Phaser from "phaser";
import { HazardSystem } from "../systems/HazardSystem";
import { Monkey } from "../entities/Monkey";
import { SwingSystem } from "../systems/SwingSystem";
import { LevelGenerator } from "../systems/LevelGenerator";
import { ScoreSystem } from "../systems/ScoreSystem";
import { SoundSystem } from "../systems/SoundSystem";
import { JungleBackdrop } from "../systems/JungleBackdrop";
import { physics } from "../config/gameConfig";
const el = (id: string) => document.getElementById(id)!;
export class GameScene extends Phaser.Scene {
  monkey!: Monkey;
  swing!: SwingSystem;
  level!: LevelGenerator;
  score!: ScoreSystem;
  hazards!: HazardSystem;
  soundFX = new SoundSystem();
  private backdrop!: JungleBackdrop;
  private playing = false;
  private paused = false;
  private pointerHeld = false;
  private keyHeld = false;
  private cameraX = 0;
  private lastHud = "";
  constructor() {
    super("Game");
  }
  create() {
    this.playing = false;
    this.paused = false;
    this.pointerHeld = false;
    this.keyHeld = false;
    this.cameraX = 0;
    this.lastHud = "";
    this.score = new ScoreSystem();
    this.backdrop = new JungleBackdrop(this);
    this.level = new LevelGenerator(this);
    this.hazards = new HazardSystem(this);
    this.hazards.populate(this.level.points, 180);
    this.monkey = new Monkey(this);
    this.swing = new SwingSystem(this, this.monkey);
    this.matter.world.pause();
    this.monkey.body.setPosition(180, 350);
    this.backdrop.draw(0);
    this.renderHUD();
    el("play").onclick = () => this.startRun();
    el("again").onclick = () => {
      el("results").classList.add("hidden");
      this.scene.restart({ autostart: true });
    };
    el("pause").onclick = () => this.togglePause();
    el("resume").onclick = () => this.togglePause();
    el("sound").onclick = () => {
      this.soundFX.enabled = !this.soundFX.enabled;
      el("sound").textContent = this.soundFX.enabled
        ? "SOUND ON ♫"
        : "SOUND OFF";
      el("sound").setAttribute("aria-pressed", String(this.soundFX.enabled));
      this.soundFX.unlock();
    };
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (
        this.playing &&
        !this.paused &&
        (pointer.wasTouch || pointer.leftButtonDown())
      )
        this.pointerHeld = true;
    });
    this.input.on("pointerup", () => {
      this.pointerHeld = false;
      this.releaseIfIdle();
    });
    this.input.on("pointerupoutside", () => {
      this.pointerHeld = false;
      this.releaseIfIdle();
    });
    this.input.keyboard?.addCapture(["SPACE", "ESC"]);
    this.input.keyboard?.on("keydown-SPACE", (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (!this.playing && el("results").classList.contains("hidden"))
        this.startRun();
      this.keyHeld = true;
    });
    this.input.keyboard?.on("keyup-SPACE", () => {
      this.keyHeld = false;
      this.releaseIfIdle();
    });
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    const blur = () => {
      if (this.playing && !this.paused) this.togglePause();
    };
    const cancelPointer = () => {
      this.pointerHeld = false;
      this.releaseIfIdle();
    };
    window.addEventListener("pointerup", cancelPointer);
    window.addEventListener("pointercancel", cancelPointer);
    window.addEventListener("blur", blur);
    const visibility = () => {
      if (document.hidden) blur();
    };
    document.addEventListener("visibilitychange", visibility);
    this.events.once("shutdown", () => {
      window.removeEventListener("pointerup", cancelPointer);
      window.removeEventListener("pointercancel", cancelPointer);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      this.swing.destroy();
      this.hazards.destroy();
      this.input.keyboard?.removeAllListeners();
    });
    if ((this.scene.settings.data as { autostart?: boolean })?.autostart)
      this.startRun();
  }
  private startRun() {
    this.soundFX.unlock();
    this.playing = true;
    el("overlay").classList.add("hidden");
    el("results").classList.add("hidden");
    el("pause").classList.remove("hidden");
    el("status").textContent = "HOLD TO GRAB · RELEASE TO FLY";
    this.monkey.body.setVelocity(physics.initialVelocity, 0);
    this.matter.world.resume();
  }
  private releaseIfIdle() {
    if (!this.pointerHeld && !this.keyHeld && this.swing.release(this.time.now))
      this.soundFX.play("release");
  }
  private togglePause() {
    if (!this.playing) return;
    this.paused = !this.paused;
    this.pointerHeld = false;
    this.keyHeld = false;
    this.swing.release(this.time.now);
    el("paused").classList.toggle("hidden", !this.paused);
    el("pause").classList.toggle("hidden", this.paused);
    if (this.paused) this.matter.world.pause();
    else this.matter.world.resume();
  }
  update(_time: number, delta: number) {
    if (!this.playing || this.paused) return;
    const b = this.monkey.body;
    const speed = this.monkey.update();
    if (
      (this.pointerHeld || this.keyHeld) &&
      this.swing.grab(this.level.points, this.time.now)
    ) {
      this.score.grab(this.swing.anchor!.id);
      this.soundFX.play("grab");
      if (speed > 13) this.cameras.main.shake(90, 0.0015);
    }
    this.swing.updatePhysics();
    this.swing.draw();
    this.level.update(b.x);
    this.hazards.populate(this.level.points, b.x);
    const hazardHit = this.hazards.update(b, delta);
    const bananas = this.level.collect(b.x, b.y);
    if (bananas) {
      this.score.bananas += bananas;
      this.soundFX.play("banana");
    }
    this.score.update(b.x, speed, delta);
    const target = Math.max(0, b.x - this.scale.width * 0.29);
    this.cameraX = Phaser.Math.Linear(
      this.cameraX,
      target,
      1 - Math.exp(-delta / 120),
    );
    this.cameras.main.scrollX = this.cameraX;
    this.cameras.main.scrollY = Phaser.Math.Linear(
      this.cameras.main.scrollY,
      Math.max(-70, Math.min(150, b.y - 420)),
      1 - Math.exp(-delta / 450),
    );
    this.backdrop.draw(this.cameraX);
    this.renderHUD();
    if (hazardHit) {
      this.cameras.main.shake(180, 0.005);
      this.cameras.main.flash(160, 203, 111, 68);
      this.endRun(
        hazardHit === "hornet"
          ? "STUNG! SWING BELOW THE HORNETS."
          : "OUCH! RELEASE EARLIER TO CLEAR THE THORNS.",
      );
      return;
    }
    if (b.y > physics.deathY || b.x < this.cameraX - 150) this.endRun();
  }
  private renderHUD() {
    const signature = `${Math.floor(this.score.distance)}:${this.score.bananas}:${this.score.score}`;
    if (signature === this.lastHud) return;
    this.lastHud = signature;
    el("distance").innerHTML =
      `${Math.floor(this.score.distance)}<span> m</span>`;
    el("bananas").textContent = String(this.score.bananas);
    el("score").textContent = String(this.score.score).padStart(5, "0");
  }
  private endRun(reason = "MISSED THE CANOPY. CATCH THE NEXT BRANCH.") {
    this.playing = false;
    this.pointerHeld = false;
    this.keyHeld = false;
    this.swing.release(this.time.now);
    this.matter.world.pause();
    this.soundFX.play("death");
    el("pause").classList.add("hidden");
    el("status").textContent = "THERE’S ALWAYS ANOTHER BRANCH";
    el("death-reason").textContent = reason;
    const s = this.score;
    el("stats").innerHTML = [
      [s.score, "FINAL SCORE"],
      [`${Math.floor(s.distance)} m`, "DISTANCE"],
      [`${Math.round(s.maxSpeed)} m/s`, "TOP SPEED"],
      [s.bananas, "BANANAS"],
      [s.longestChain, "LONGEST CHAIN"],
      [`${s.duration.toFixed(1)} s`, "RUN TIME"],
    ]
      .map(([v, l]) => `<div><b>${v}</b>${l}</div>`)
      .join("");
    el("results").classList.remove("hidden");
  }
}
