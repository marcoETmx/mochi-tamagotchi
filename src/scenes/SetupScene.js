import Phaser from "phaser";
import { Pet } from "../objects/Pet.js";
import { createDefaultState } from "../petState.js";
import { SPECIES_LIST, sanitizeName } from "../species.js";
import { saveState } from "../storage.js";
import { H, W, makePill } from "../ui.js";
import { sfxTap } from "../sfx.js";

export class SetupScene extends Phaser.Scene {
  constructor() {
    super("setup");
  }

  create() {
    this.petName = "";
    this.species = null;

    this.add.image(W / 2, H / 2, "sky");
    this.drawDecor();

    this.add
      .text(W / 2, 72, "Nueva mascota", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "34px",
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, 118, "¿Cómo se llama tu mascota?", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "18px",
        color: "#c97b9a",
        fontStyle: "500",
      })
      .setOrigin(0.5);

    this.nameField = this.makeNameField(W / 2, 176);

    this.add
      .text(W / 2, 248, "Elige tu mascota", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "18px",
        color: "#c97b9a",
        fontStyle: "500",
      })
      .setOrigin(0.5);

    this.cards = SPECIES_LIST.map((spec, i) => {
      const x = i === 0 ? 108 : 282;
      return this.makeSpeciesCard(x, 460, spec.id);
    });

    this.startBtn = makePill(this, W / 2, 730, 240, 64, 0xffd1dc, "¡Empezar! 🌸", () => {
      if (!this.canStart()) return;
      sfxTap();
      const state = createDefaultState(this.petName, this.species);
      saveState(state);
      this.scene.start("game");
    });

    this.refreshStart();
  }

  makeNameField(x, y) {
    const w = 280;
    const h = 56;
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
        fontSize: "20px",
        color: "#c97b9a",
        fontStyle: "600",
      })
      .setOrigin(0.5);

    container.add([shadow, bg, label]);
    container.setSize(w, h);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on("pointerup", () => this.askName());
    container.label = label;
    return container;
  }

  makeSpeciesCard(x, y, speciesId) {
    const w = 156;
    const h = 280;
    const container = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x5a3d4a, 0.12);
    shadow.fillRoundedRect(-w / 2 + 2, -h / 2 + 6, w, h, 24);

    const bg = this.add.graphics();
    bg.fillStyle(0xfff7fb, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 24);

    const ring = this.add.graphics();
    const pet = new Pet(this, 0, 0, speciesId);
    pet.setMood("happy");
    const wrap = this.add.container(0, -8);
    wrap.add(pet);
    wrap.setScale(0.56);

    const spec = SPECIES_LIST.find((item) => item.id === speciesId);
    const label = this.add
      .text(0, 112, spec.label, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "18px",
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    container.add([shadow, bg, ring, wrap, label]);
    container.setSize(w, h);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on("pointerup", () => {
      sfxTap();
      this.pickSpecies(speciesId);
    });

    container.ring = ring;
    container.speciesId = speciesId;
    container.cardW = w;
    container.cardH = h;
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
          22,
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

  drawDecor() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.55);
    g.fillEllipse(70, 230, 90, 48);
    g.fillEllipse(110, 230, 70, 40);
    g.fillEllipse(300, 210, 100, 52);
    g.fillEllipse(340, 214, 64, 36);
    g.fillStyle(0xfff0c2, 1);
    g.fillCircle(48, 96, 24);
    g.fillStyle(0xffe08a, 0.35);
    g.fillCircle(48, 96, 38);
  }
}
