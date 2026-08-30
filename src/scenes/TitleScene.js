import Phaser from "phaser";
import { Pet } from "../objects/Pet.js";
import { applyElapsed, createDefaultState } from "../petState.js";
import { loadState, saveState } from "../storage.js";
import { makePill } from "../ui.js";
import { sfxTap } from "../sfx.js";
import { view } from "../viewport.js";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("title");
  }

  create() {
    const { w, h, cx, safe, u, font } = view(this);
    this.layoutW = w;
    this.layoutH = h;
    this.events.once("shutdown", () => this.scale.off("resize", this.handleResize, this));
    this.scale.on("resize", this.handleResize, this);

    this.add.image(cx, h / 2, "sky").setDisplaySize(w, h);

    this.drawDecor(w, h, u);

    const saved = loadState();
    const petY = h * 0.42;
    const preview = this.add.container(cx, petY);
    const shadow = this.add.ellipse(0, 88, 150, 32, 0x5a3d4a, 0.14);
    preview.add(shadow);
    const pet = new Pet(this, 0, 0);
    preview.add(pet);
    pet.setMood("happy");
    const petScale = Phaser.Math.Clamp(Math.min(w, h) / 700, 0.8, 2.4);
    preview.setScale(petScale);

    this.tweens.add({
      targets: preview,
      y: petY - 12,
      yoyo: true,
      duration: 1400,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.add
      .text(cx, safe.top + 56 * u, "MOCHI", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(Math.min(64, 58)),
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, safe.top + 112 * u, "tu mascota kawaii", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(20),
        color: "#c97b9a",
        fontStyle: "500",
      })
      .setOrigin(0.5);

    const hasSave = Boolean(saved) && !saved.dead;
    const label = hasSave ? "Continuar 💕" : "¡Cuidar! 🌸";
    const btnW = Math.min(280 * u, w - 48 * u);
    makePill(this, cx, h - safe.bottom - 110 * u, btnW, 68 * u, 0xfff7fb, label, () => {
      sfxTap();
      let state = loadState();
      if (!state || state.dead) {
        state = createDefaultState();
        saveState(state);
      } else {
        applyElapsed(state);
        saveState(state);
      }
      this.scene.start("game");
    });

    if (saved?.dead) {
      this.add
        .text(cx, h - safe.bottom - 58 * u, "Tu anterior Mochi descansa en paz...", {
          fontFamily: "Fredoka, sans-serif",
          fontSize: font(14),
          color: "#c97b9a",
        })
        .setOrigin(0.5);
    }

    this.add
      .text(cx, h - safe.bottom - 28 * u, "Aliméntalo · Juega · Báñalo · Cúralo", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(14),
        color: "#9a7a88",
      })
      .setOrigin(0.5);
  }

  handleResize(gameSize) {
    if (Math.abs(gameSize.width - this.layoutW) < 12 && Math.abs(gameSize.height - this.layoutH) < 12) {
      return;
    }
    this.scene.restart();
  }

  drawDecor(w, h, u) {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(w * 0.18, h * 0.27, 90 * u, 48 * u);
    g.fillEllipse(w * 0.28, h * 0.27, 70 * u, 40 * u);
    g.fillEllipse(w * 0.78, h * 0.25, 100 * u, 52 * u);
    g.fillEllipse(w * 0.88, h * 0.255, 64 * u, 36 * u);
    g.fillStyle(0xfff0c2, 1);
    g.fillCircle(w * 0.8, h * 0.12, 28 * u);
    g.fillStyle(0xffe08a, 0.35);
    g.fillCircle(w * 0.8, h * 0.12, 42 * u);
  }
}
