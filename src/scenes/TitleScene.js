import Phaser from "phaser";
import { Pet } from "../objects/Pet.js";
import { applyElapsed } from "../petState.js";
import { loadState, saveState } from "../storage.js";
import { DEFAULT_SPECIES } from "../species.js";
import { H, W, makePill } from "../ui.js";
import { sfxTap } from "../sfx.js";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("title");
  }

  create() {
    this.add.image(W / 2, H / 2, "sky");
    this.drawDecor();

    const saved = loadState();
    const preview = this.add.container(W / 2, 340);
    const shadow = this.add.ellipse(0, 88, 150, 32, 0x5a3d4a, 0.14);
    preview.add(shadow);
    const pet = new Pet(this, 0, 0, saved?.species || DEFAULT_SPECIES);
    preview.add(pet);
    pet.setMood("happy");

    this.tweens.add({
      targets: preview,
      y: 328,
      yoyo: true,
      duration: 1400,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.add
      .text(W / 2, 118, "MOCHI", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "58px",
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, 172, "tu mascota kawaii", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "20px",
        color: "#c97b9a",
        fontStyle: "500",
      })
      .setOrigin(0.5);

    const hasSave = Boolean(saved) && !saved.dead;
    const label = hasSave ? "Continuar 💕" : "¡Cuidar! 🌸";

    makePill(this, W / 2, 620, 240, 64, 0xfff7fb, label, () => {
      sfxTap();
      const state = loadState();
      if (!state || state.dead) {
        this.scene.start("setup");
        return;
      }
      applyElapsed(state);
      saveState(state);
      this.scene.start("game");
    });

    if (saved?.dead) {
      const who = saved.name || "tu mascota";
      this.add
        .text(W / 2, 690, `Tu anterior ${who} descansa en paz...`, {
          fontFamily: "Fredoka, sans-serif",
          fontSize: "14px",
          color: "#c97b9a",
        })
        .setOrigin(0.5);
    }

    this.add
      .text(W / 2, 790, "Aliméntalo · Juega · Báñalo · Cúralo", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "14px",
        color: "#9a7a88",
      })
      .setOrigin(0.5);
  }

  drawDecor() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(70, 230, 90, 48);
    g.fillEllipse(110, 230, 70, 40);
    g.fillEllipse(300, 210, 100, 52);
    g.fillEllipse(340, 214, 64, 36);
    g.fillStyle(0xfff0c2, 1);
    g.fillCircle(310, 96, 28);
    g.fillStyle(0xffe08a, 0.35);
    g.fillCircle(310, 96, 42);
  }
}
