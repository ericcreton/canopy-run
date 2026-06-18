import Phaser from "phaser";
import { seededRandom } from "./rules";
export class JungleBackdrop {
  private layers: Phaser.GameObjects.Graphics[] = [];
  constructor(private scene: Phaser.Scene) {
    for (let i = 0; i < 4; i++)
      this.layers.push(
        scene.add
          .graphics()
          .setScrollFactor(0)
          .setDepth(-10 + i),
      );
  }
  draw(cameraX: number) {
    const width = this.scene.scale.width,
      height = this.scene.scale.height;
    const bg = this.layers[0];
    bg.clear();
    bg.fillGradientStyle(0x96b9a1, 0xafc4a0, 0xd5d4a0, 0xbbc991, 1);
    bg.fillRect(0, 0, width, height);
    bg.fillStyle(0xf3e8b1, 0.4);
    bg.fillCircle(width * 0.73, height * 0.27, 56);
    bg.fillStyle(0xe9e2af, 0.08);
    bg.fillCircle(width * 0.73, height * 0.27, 95);
    for (let layer = 1; layer < 4; layer++) {
      const g = this.layers[layer];
      g.clear();
      const random = seededRandom(100 + layer),
        spacing = layer === 3 ? 410 : 190;
      const offset = cameraX * (layer * 0.14);
      const color = [0, 0x739b82, 0x477c68, 0x255c4b][layer];
      for (let i = -2; i < Math.ceil(width / spacing) + 3; i++) {
        const x = i * spacing - (((offset % spacing) + spacing) % spacing);
        const treeHeight = height * (0.55 + random() * 0.35);
        const y = height - treeHeight;
        g.fillStyle(color, layer === 1 ? 0.4 : 0.65);
        g.fillRect(x + 65, y, layer * 11 + 15, treeHeight);
        g.fillEllipse(x + 80, y + 30, spacing * 1.3, 120 + layer * 15);
        g.fillEllipse(x + 15, y + 55, 130, 85);
        g.fillEllipse(x + 155, y + 65, 170, 100);
        g.lineStyle(layer * 6, color, 0.55);
        g.lineBetween(x + 78, y + 130, x + 20, y + 48);
        g.lineBetween(x + 80, y + 180, x + 150, y + 60);
      }
      if (layer === 3) {
        g.fillStyle(0x184c3f);
        g.fillEllipse(width * 0.15, height + 70, width * 0.8, 240);
        g.fillEllipse(width * 0.8, height + 80, width, 240);
        const leafRandom = seededRandom(6);
        for (let i = 0; i < 50; i++) {
          const x = (i * width) / 48;
          g.fillStyle(i % 2 ? 0x285d45 : 0x1c4d3c);
          g.fillEllipse(
            x,
            height - 15 - leafRandom() * 35,
            22 + leafRandom() * 22,
            70 + leafRandom() * 75,
          );
        }
      }
    }
  }
}
