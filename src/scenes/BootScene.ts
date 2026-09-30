import Phaser from "phaser";
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }
  create() {
    const g = this.make.graphics({ x: 0, y: 0 });
    // All artwork is generated locally; no asset downloads are required.

    g.clear();
    g.lineStyle(7, 0x70452a);
    g.beginPath();
    g.moveTo(34, 43);
    g.lineTo(16, 52);
    g.lineTo(9, 43);
    g.lineTo(13, 33);
    g.strokePath();
    g.fillStyle(0x855133);
    g.fillEllipse(39, 40, 29, 33);
    g.fillStyle(0xc59057);
    g.fillEllipse(41, 43, 18, 23);
    g.lineStyle(7, 0x855133);
    g.lineBetween(34, 51, 27, 61);
    g.lineBetween(46, 51, 55, 59);
    g.fillStyle(0x855133);
    g.fillCircle(39, 23, 20);
    g.fillCircle(19, 23, 8);
    g.fillCircle(59, 23, 8);
    g.fillStyle(0xe5b878);
    g.fillCircle(19, 23, 5);
    g.fillCircle(59, 23, 5);
    g.fillEllipse(39, 28, 29, 25);
    g.fillStyle(0x233b2d);
    g.fillCircle(33, 24, 2.5);
    g.fillCircle(46, 24, 2.5);
    g.lineStyle(2, 0x70452a);
    g.beginPath();
    g.arc(40, 30, 6, 0, Math.PI);
    g.strokePath();
    g.generateTexture("monkey", 76, 70);
    g.clear();
    g.lineStyle(9, 0xf3cb62);
    g.beginPath();
    g.arc(12, 8, 13, 0.15, 2.3);
    g.strokePath();
    g.lineStyle(3, 0xffeaa0);
    g.beginPath();
    g.arc(12, 7, 10, 0.25, 2.1);
    g.strokePath();
    g.fillStyle(0x76613c);
    g.fillCircle(25, 10, 2);
    g.generateTexture("banana", 32, 30);
    g.clear();
    g.lineStyle(15, 0x355540);
    g.lineBetween(4, 83, 155, 71);
    g.lineStyle(7, 0x63714b);
    g.lineBetween(10, 79, 151, 67);
    g.lineStyle(5, 0x355540);
    g.lineBetween(71, 76, 48, 50);
    g.lineBetween(105, 73, 125, 45);
    g.fillStyle(0x5c8052);
    for (const [x, y, r] of [
      [27, 50, 23],
      [55, 44, 29],
      [89, 45, 23],
      [121, 34, 31],
      [152, 49, 20],
    ])
      g.fillEllipse(x, y, r * 1.8, r);
    g.fillStyle(0x81985e);
    g.fillEllipse(45, 35, 43, 15);
    g.fillEllipse(120, 24, 45, 15);
    g.generateTexture("branch", 180, 100);
    g.clear();
    // Warm colors distinguish danger from the green canopy and yellow bananas.
    g.fillStyle(0xeaf4d9, 0.85);
    g.fillEllipse(28, 17, 26, 17);
    g.fillEllipse(48, 17, 26, 17);
    g.lineStyle(2, 0x355540);
    g.strokeEllipse(28, 17, 26, 17);
    g.strokeEllipse(48, 17, 26, 17);
    g.fillStyle(0x392c31);
    g.fillTriangle(63, 27, 77, 34, 63, 39);
    g.fillStyle(0xe69c4c);
    g.fillEllipse(41, 34, 46, 29);
    g.fillStyle(0x63402e);
    g.fillRoundedRect(37, 21, 7, 26, 3);
    g.fillRoundedRect(51, 23, 6, 22, 3);
    g.fillStyle(0xbb633e);
    g.fillCircle(23, 32, 14);
    g.fillStyle(0xfff4d1);
    g.fillCircle(19, 29, 6);
    g.fillStyle(0x2e3030);
    g.fillCircle(17, 30, 3);
    g.lineStyle(3, 0x392c31);
    g.lineBetween(13, 21, 24, 24);
    g.generateTexture("hornet", 80, 58);
    g.clear();
    g.lineStyle(4, 0x77513e);
    g.lineBetween(37, 0, 39, 13);
    g.fillStyle(0xd18459);
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      g.fillTriangle(
        38 + Math.cos(angle - 0.3) * 19,
        38 + Math.sin(angle - 0.3) * 19,
        38 + Math.cos(angle) * 34,
        38 + Math.sin(angle) * 34,
        38 + Math.cos(angle + 0.3) * 19,
        38 + Math.sin(angle + 0.3) * 19,
      );
    }
    g.fillStyle(0x944939);
    g.fillCircle(38, 38, 23);
    g.fillStyle(0xc57149);
    g.fillCircle(33, 32, 15);
    g.fillStyle(0x6e3f33);
    g.fillCircle(29, 29, 3);
    g.fillCircle(43, 36, 4);
    g.fillCircle(33, 45, 3);
    g.generateTexture("thorns", 76, 76);
    g.destroy();
    this.scene.start("Game");
  }
}
