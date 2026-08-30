import Phaser from "phaser";
import { Pet } from "../objects/Pet.js";
import { createDefaultState } from "../petState.js";
import { SPECIES_LIST, sanitizeName } from "../species.js";
import { saveState } from "../storage.js";
import { enableContainerInput, makePill } from "../ui.js";
import { sfxTap } from "../sfx.js";
import { view } from "../viewport.js";

export class SetupScene extends Phaser.Scene {
  constructor() {
    super("setup");
  }

  create() {
    this.petName = "";
    this.species = null;

    const { w, h, cx, safe, u, font } = view(this);
    this.layoutW = w;
    this.layoutH = h;
    this.events.once("shutdown", () => this.scale.off("resize", this.handleResize, this));
    this.scale.on("resize", this.handleResize, this);

    this.add.image(cx, h / 2, "sky").setDisplaySize(w, h);
    this.drawDecor(w, h, u);

    this.add
      .text(cx, safe.top + 40 * u, "Nueva mascota", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(34),
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, safe.top + 86 * u, "¿Cómo se llama tu mascota?", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(18),
        color: "#c97b9a",
        fontStyle: "500",
      })
      .setOrigin(0.5);

    const fieldW = Math.min(280 * u, w - 48 * u);
    this.nameField = this.makeNameField(cx, safe.top + 140 * u, fieldW, 56 * u, font);

    this.add
      .text(cx, safe.top + 198 * u, "Elige tu mascota", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(18),
        color: "#c97b9a",
        fontStyle: "500",
      })
      .setOrigin(0.5);

    const cardW = Math.min(168 * u, (w - 56 * u) / 2);
    const cardH = Math.min(300 * u, h * 0.4);
    const gap = 16 * u;
    const cardsY = safe.top + 198 * u + 28 * u + cardH / 2;
    this.cards = SPECIES_LIST.map((spec, i) => {
      const x = i === 0 ? cx - cardW / 2 - gap / 2 : cx + cardW / 2 + gap / 2;
      return this.makeSpeciesCard(x, cardsY, spec.id, cardW, cardH, font, u);
    });

    const btnW = Math.min(280 * u, w - 48 * u);
    this.startBtn = makePill(this, cx, h - safe.bottom - 56 * u, btnW, 64 * u, 0xffd1dc, "¡Empezar! 🌸", () => {
      if (!this.canStart()) return;
      sfxTap();
      const state = createDefaultState(this.petName, this.species);
      saveState(state);
      this.scene.start("game");
    });

    this.refreshStart();
  }

  handleResize(gameSize) {
    if (Math.abs(gameSize.width - this.layoutW) < 12 && Math.abs(gameSize.height - this.layoutH) < 12) {
      return;
    }
    this.scene.restart();
  }

  makeNameField(x, y, w, h, font) {
    const container = this.add.container(x, y);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x5a3d4a, 0.12);
    shadow.fillRoundedRect(-w / 2 + 1, -h / 2 + 4, w, h, h / 2);

    const bg = this.add.graphics();
    bg.fillStyle(0xfff7fb, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);

    const label = this.add
      .text(0, 0, "Toca para escribir...", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(20),
        color: "#c97b9a",
        fontStyle: "600",
      })
      .setOrigin(0.5);

    container.add([shadow, bg, label]);
    enableContainerInput(container, w, h);
    container.on("pointerup", () => this.askName());
    container.label = label;
    return container;
  }

  makeSpeciesCard(x, y, speciesId, w, h, font, u) {
    const container = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x5a3d4a, 0.12);
    shadow.fillRoundedRect(-w / 2 + 2, -h / 2 + 6, w, h, 24 * u);

    const bg = this.add.graphics();
    bg.fillStyle(0xfff7fb, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 24 * u);

    const ring = this.add.graphics();
    const pet = new Pet(this, 0, 0, speciesId);
    pet.setMood("happy");
    const wrap = this.add.container(0, -10 * u);
    wrap.add(pet);
    wrap.setScale(Phaser.Math.Clamp(Math.min(w, h) / 380, 0.42, 0.9));

    const spec = SPECIES_LIST.find((item) => item.id === speciesId);
    const label = this.add
      .text(0, h / 2 - 28 * u, spec.label, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(18),
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    container.add([shadow, bg, ring, wrap, label]);
    enableContainerInput(container, w, h);
    container.on("pointerup", () => {
      sfxTap();
      this.pickSpecies(speciesId);
    });

    container.ring = ring;
    container.speciesId = speciesId;
    container.cardW = w;
    container.cardH = h;
    container.radius = 22 * u;
    return container;
  }

  askName() {
    const next = window.prompt("¿Cómo se llama tu mascota?", this.petName);
    if (next == null) return;
    this.petName = sanitizeName(next);
    if (this.petName) {
      this.nameField.label.setText(this.petName);
      this.nameField.label.setColor("#5a3d4a");
    } else {
      this.nameField.label.setText("Toca para escribir...");
      this.nameField.label.setColor("#c97b9a");
    }
    this.refreshStart();
  }

  pickSpecies(speciesId) {
    this.species = speciesId;
    for (const card of this.cards) {
      const selected = card.speciesId === speciesId;
      card.ring.clear();
      if (selected) {
        card.ring.lineStyle(5, 0xff8fab, 1);
        card.ring.strokeRoundedRect(
          -card.cardW / 2 + 2,
          -card.cardH / 2 + 2,
          card.cardW - 4,
          card.cardH - 4,
          card.radius,
        );
      }
      this.tweens.add({
        targets: card,
        scale: selected ? 1.04 : 1,
        duration: 140,
        ease: "Back.out",
      });
    }
    this.refreshStart();
  }

  canStart() {
    return Boolean(this.petName) && Boolean(this.species);
  }

  refreshStart() {
    const ready = this.canStart();
    this.startBtn.setAlpha(ready ? 1 : 0.45);
  }

  drawDecor(w, h, u) {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(w * 0.18, h * 0.27, 90 * u, 48 * u);
    g.fillEllipse(w * 0.28, h * 0.27, 70 * u, 40 * u);
    g.fillEllipse(w * 0.78, h * 0.25, 100 * u, 52 * u);
    g.fillEllipse(w * 0.88, h * 0.255, 64 * u, 36 * u);
    g.fillStyle(0xfff0c2, 1);
    g.fillCircle(w * 0.12, h * 0.11, 24 * u);
    g.fillStyle(0xffe08a, 0.35);
    g.fillCircle(w * 0.12, h * 0.11, 38 * u);
  }
}
