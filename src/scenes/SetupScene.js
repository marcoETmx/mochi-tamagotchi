import Phaser from "phaser";
import { Pet } from "../objects/Pet.js";
import { createDefaultState } from "../petState.js";
import { SPECIES_LIST, sanitizeName } from "../species.js";
import { saveState } from "../storage.js";
import { makePill } from "../ui.js";
import { sfxTap } from "../sfx.js";
import { view } from "../viewport.js";
import { destroyNameInput, isNameInputFocused, mountNameInput } from "../nameInput.js";

export class SetupScene extends Phaser.Scene {
  constructor() {
    super("setup");
  }

  create() {
    this.petName = sanitizeName(this.registry.get("setupName") || "");
    this.species = this.registry.get("setupSpecies") || null;
    this.nameOverlay = null;

    const { w, h, cx, safe, u, font } = view(this);
    this.layoutW = w;
    this.events.once("shutdown", () => {
      this.scale.off("resize", this.handleResize, this);
      destroyNameInput();
    });
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
    const fieldH = 56 * u;
    const fieldY = safe.top + 140 * u;
    this.makeNameField(cx, fieldY, fieldW, fieldH);
    this.nameOverlay = mountNameInput(this, {
      x: cx,
      y: fieldY,
      w: fieldW,
      h: fieldH,
      value: this.petName,
      onChange: (name) => {
        this.petName = name;
        this.registry.set("setupName", name);
        this.refreshStart();
      },
    });

    const startY = h - safe.bottom - 56 * u;
    const chooseY = fieldY + fieldH / 2 + 28 * u;
    this.add
      .text(cx, chooseY, "Elige tu mascota", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(18),
        color: "#c97b9a",
        fontStyle: "500",
      })
      .setOrigin(0.5);

    const cardsTop = chooseY + 24 * u;
    const cardsBottom = startY - 48 * u;
    const gap = 16 * u;
    const cardW = Math.min(168 * u, (w - 56 * u) / 2);
    const cardH = Math.max(160 * u, Math.min(300 * u, cardsBottom - cardsTop, h * 0.38));
    const cardsY = cardsTop + cardH / 2;
    this.cards = SPECIES_LIST.map((spec, i) => {
      const x = i === 0 ? cx - cardW / 2 - gap / 2 : cx + cardW / 2 + gap / 2;
      return this.makeSpeciesCard(x, cardsY, spec.id, cardW, cardH, font, u);
    });

    const btnW = Math.min(280 * u, w - 48 * u);
    this.startBtn = makePill(this, cx, startY, btnW, 64 * u, 0xffd1dc, "¡Empezar! 🌸", () => {
      if (!this.canStart()) return;
      sfxTap();
      destroyNameInput();
      this.registry.remove("setupName");
      this.registry.remove("setupSpecies");
      const state = createDefaultState(this.petName, this.species);
      saveState(state);
      this.scene.start("game");
    });

    if (this.species) this.pickSpecies(this.species, true);
    this.refreshStart();
  }

  handleResize(gameSize) {
    if (isNameInputFocused()) {
      this.nameOverlay?.place();
      return;
    }
    if (Math.abs(gameSize.width - this.layoutW) < 24) {
      this.nameOverlay?.place();
      return;
    }
    this.scene.restart();
  }

  makeNameField(x, y, w, h) {
    const shadow = this.add.graphics();
    shadow.fillStyle(0x5a3d4a, 0.12);
    shadow.fillRoundedRect(x - w / 2 + 1, y - h / 2 + 4, w, h, h / 2);

    const bg = this.add.graphics();
    bg.fillStyle(0xfff7fb, 1);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
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
    pet.disableInteractive?.();
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
    container.setSize(w, h);
    container.setDepth(8);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on("pointerdown", () => this.pickSpecies(speciesId));

    container.ring = ring;
    container.speciesId = speciesId;
    container.cardW = w;
    container.cardH = h;
    container.radius = 22 * u;
    return container;
  }

  pickSpecies(speciesId, silent = false) {
    const changed = this.species !== speciesId;
    this.species = speciesId;
    this.registry.set("setupSpecies", speciesId);
    if (changed && !silent) sfxTap();
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
