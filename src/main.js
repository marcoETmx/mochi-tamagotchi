import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene.js";
import { TitleScene } from "./scenes/TitleScene.js";
import { SetupScene } from "./scenes/SetupScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { isNameInputFocused } from "./nameInput.js";
import { cssSize, dpr } from "./viewport.js";

function start() {
  const ratio = dpr();
  const size = cssSize();

  const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: Math.round(size.width * ratio),
    height: Math.round(size.height * ratio),
    zoom: 1 / ratio,
    backgroundColor: "#ffd6ec",
    antialias: true,
    scale: {
      mode: Phaser.Scale.NONE,
      parent: "game",
      autoCenter: Phaser.Scale.CENTER_BOTH,
      expandParent: true,
      autoRound: true,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
      powerPreference: "high-performance",
    },
    input: {
      activePointers: 3,
    },
    scene: [BootScene, TitleScene, SetupScene, GameScene],
  };

  const game = new Phaser.Game(config);
  globalThis.game = game;

  const refresh = () => {
    if (isNameInputFocused()) return;
    const next = cssSize();
    const pixelRatio = dpr();
    const width = Math.round(next.width * pixelRatio);
    const height = Math.round(next.height * pixelRatio);
    game.scale.setZoom(1 / pixelRatio);

    const widthChanged = Math.abs(game.scale.width - width) > 2;
    if (widthChanged) {
      game.scale.resize(width, height);
      return;
    }

    // Height-only shrinks are the mobile keyboard or browser chrome.
    // Resizing (and restarting scenes) made the setup form look broken.
    if (height > game.scale.height + 24) {
      game.scale.resize(width, height);
    }
  };

  window.addEventListener("resize", refresh);
  window.addEventListener("orientationchange", () => setTimeout(refresh, 200));
  window.visualViewport?.addEventListener("resize", refresh);

  game.canvas.addEventListener(
    "touchmove",
    (event) => {
      event.preventDefault();
    },
    { passive: false },
  );
}

if (document.fonts?.ready) {
  document.fonts.ready.then(start, start);
} else {
  start();
}
