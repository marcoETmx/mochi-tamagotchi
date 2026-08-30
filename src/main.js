import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene.js";
import { TitleScene } from "./scenes/TitleScene.js";
import { SetupScene } from "./scenes/SetupScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { H, W } from "./ui.js";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: W,
  height: H,
  backgroundColor: "#ffd6ec",
  antialias: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  scene: [BootScene, TitleScene, SetupScene, GameScene],
};

document.addEventListener(
  "touchmove",
  (event) => {
    event.preventDefault();
  },
  { passive: false },
);

function start() {
  globalThis.game = new Phaser.Game(config);
}

if (document.fonts?.ready) {
  document.fonts.ready.then(start, start);
} else {
  start();
}
