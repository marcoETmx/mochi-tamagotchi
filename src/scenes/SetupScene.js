import Phaser from "phaser";
import { Pet } from "../objects/Pet.js";
import { createDefaultState } from "../petState.js";
import { SPECIES_LIST, sanitizeName } from "../species.js";
import { saveState } from "../storage.js";
import { makePill, toast } from "../ui.js";
import { sfxDeny, sfxTap } from "../sfx.js";
import { view } from "../viewport.js";
import { mountNameField, isNameInputFocused } from "../nameInput.js";

export class SetupScene extends Phaser.Scene {
  static draft = { name: "", species: null };

  constructor() {
    super("setup");
  }

  create() {
    this.petName = SetupScene.draft.name || "";
    this.species = SetupScene.draft.species || null;

    const { w, h, cx, safe, u, font } = view(this);
    this.layoutW = w;
    this.layoutH = h;
    this.events.once("shutdown", () => this.scale.off("resize", this.handleResize, this));
    this.scale.on("resize", this.handleResize, this);

    this.add.image(cx, h / 2, "sky").setDisplaySize(w, h);
    this.drawDecor(w, h, u);

    this.add
      .text(cx, safe.top + 36 * u, "Nueva mascota", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(34),
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.add
      .text(cx, safe.top + 80 * u, "¿Cómo se llama tu mascota?", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(18),
        color: "#c97b9a",
        fontStyle: "500",
      })
      .setOrigin(0.5);

    const fieldW = Math.min(280 * u, w - 48 * u);
    const fieldH = 56 * u;
    const fieldY = safe.top + 132 * u;
    this.nameField = this.makeNameField(cx, fieldY, fieldW, fieldH);
    this.nameInput = mountNameField(this, {
      x: cx,
      y: fieldY,
      w: fieldW,
      h: fieldH,
      value: this.petName,
      placeholder: "Toca para escribir...",
      onChange: (raw) => this.setName(raw),
    });

    this.add
      .text(cx, fieldY + fieldH / 2 + 28 * u, "Elige tu mascota", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(18),
        color: "#c97b9a",
        fontStyle: "500",
      })
      .setOrigin(0.5);

    const btnH = 64 * u;
    const btnY = h - safe.bottom - btnH / 2 - 16 * u;
    const chooseTop = fieldY + fieldH / 2 + 52 * u;
    const cardsBottom = btnY - btnH / 2 - 18 * u;
    const cardW = Math.min(168 * u, (w - 56 * u) / 2);
    const cardH = Math.max(180 * u, Math.min(cardsBottom - chooseTop, 360 * u));
    const gap = 16 * u;
    const cardsY = chooseTop + cardH / 2;

    this.cards = SPECIES_LIST.map((spec, i) => {
      const x = i === 0 ? cx - cardW / 2 - gap / 2 : cx + cardW / 2 + gap / 2;
      return this.makeSpeciesCard(x, cardsY, spec.id, cardW, cardH, font, u);
    });

    const btnW = Math.min(280 * u, w - 48 * u);
    this.startBtn = makePill(this, cx, btnY, btnW, btnH, 0xffd1dc, "¡Empezar! 🌸", () => {
      if (!this.canStart()) {
        sfxDeny();
        toast(this, !this.petName ? "Ponle un nombre ✍️" : "Elige tu mascota 💕");
        return;
      }
      sfxTap();
      const state = createDefaultState(this.petName, this.species);
      saveState(state);
      SetupScene.draft = { name: "", species: null };
      this.scene.start("game");
    });

    if (this.species) this.pickSpecies(this.species);
    this.refreshStart();
  }

  handleResize(gameSize) {
    if (isNameInputFocused()) return;
    if (Math.abs(gameSize.width - this.layoutW) < 12) return;
    this.scene.restart();
  }

  makeNameField(x, y, w, h) {
    const container = this.add.container(x, y);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x5a3d4a, 0.12);
    shadow.fillRoundedRect(-w / 2 + 1, -h / 2 + 4, w, h, h / 2);
    const bg = this.add.graphics();
    bg.fillStyle(0xfff7fb, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    container.add([shadow, bg]);
    container.setSize(w, h);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on("pointerup", () => this.nameInput?.focus());
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
    pet.disableInteractive();
    const wrap = this.add.container(0, -12 * u);
    wrap.add(pet);
    wrap.setScale(Phaser.Math.Clamp(Math.min(w, h * 0.7) / 380, 0.38, 0.85));

    const spec = SPECIES_LIST.find((item) => item.id === speciesId);
    const label = this.add
      .text(0, h / 2 - 28 * u, spec.label, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(18),
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    const hit = this.add.zone(0, 0, w, h);
    hit.setInteractive({ useHandCursor: true });
    hit.on("pointerdown", () => {
      this.tweens.add({ targets: container, scale: 0.96, duration: 70 });
    });
    hit.on("pointerup", () => {
      this.tweens.add({ targets: container, scale: 1.04, duration: 90, ease: "Back.out" });
      sfxTap();
      this.pickSpecies(speciesId);
    });
    hit.on("pointerout", () => {
      const selected = this.species === speciesId;
      this.tweens.add({ targets: container, scale: selected ? 1.04 : 1, duration: 90 });
    });

    container.add([shadow, bg, ring, wrap, label, hit]);
    container.setSize(w, h);

    container.ring = ring;
    container.bg = bg;
    container.speciesId = speciesId;
    container.cardW = w;
    container.cardH = h;
    container.radius = 22 * u;
    return container;
  }

  setName(raw) {
    this.petName = sanitizeName(raw);
    SetupScene.draft.name = this.petName;
    this.refreshStart();
  }

  pickSpecies(speciesId) {
    this.species = speciesId;
    SetupScene.draft.species = speciesId;
    for (const card of this.cards) {
      const selected = card.speciesId === speciesId;
      card.bg.clear();
      card.bg.fillStyle(selected ? 0xffe4ef : 0xfff7fb, 1);
      card.bg.fillRoundedRect(
        -card.cardW / 2,
        -card.cardH / 2,
        card.cardW,
        card.cardH,
        card.radius,
      );
      card.ring.clear();
      if (selected) {
        card.ring.lineStyle(6, 0xff8fab, 1);
        card.ring.strokeRoundedRect(
          -card.cardW / 2 + 3,
          -card.cardH / 2 + 3,
          card.cardW - 6,
          card.cardH - 6,
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
    g.fillCircle(w * 0.88, h * 0.11, 24 * u);
    g.fillStyle(0xffe08a, 0.35);
    g.fillCircle(w * 0.88, h * 0.11, 38 * u);
  }
}
