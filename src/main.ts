import Phaser from "phaser";
import "./style.css";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { physics } from "./config/gameConfig";
const breakpoint = window.matchMedia("(max-width: 700px)");
const mobile = breakpoint.matches;
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: mobile ? 480 : 1200,
  height: mobile ? 600 : 600,
  backgroundColor: "#9cbba0",
  antialias: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: {
    default: "matter",
    matter: {
      gravity: { x: 0, y: physics.gravity },
      enableSleeping: false,
      positionIterations: 10,
      velocityIterations: 8,
      constraintIterations: 6,
    },
  },
  scene: [BootScene, GameScene],
});

breakpoint.addEventListener("change", ({ matches }) => {
  game.scale.resize(matches ? 480 : 1200, 600);
});
