import Phaser from "phaser";
import { Pet } from "../objects/Pet.js";
import {
  STATS,
  ageInDays,
  applyElapsed,
  bathe,
  boop,
  createDefaultState,
  feed,
  getMood,
  heal,
  play,
  toggleSleep,
} from "../petState.js";
import { clearState, loadState, saveState } from "../storage.js";
import {
  isMuted,
  sfxBath,
  sfxBoop,
  sfxDeny,
  sfxFeed,
  sfxHeal,
  sfxPlay,
  sfxSad,
  sfxSleep,
  sfxTap,
  toggleMute,
} from "../sfx.js";
import { makeButton, makePill, toast } from "../ui.js";
import { view } from "../viewport.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  create() {
    this.state = loadState() || createDefaultState();
    applyElapsed(this.state);
    saveState(this.state);

    const { w, h, cx, safe, u, font } = view(this);
    this.layoutW = w;
    this.layoutH = h;
    this.events.once("shutdown", () => this.scale.off("resize", this.handleResize, this));
    this.scale.on("resize", this.handleResize, this);

    this.add.image(cx, h / 2, "sky").setDisplaySize(w, h);
    this.drawRoom(w, h, cx, u);

    const hudBottom = safe.top + 150 * u;
    const actionsTop = h - safe.bottom - 130 * u;
    const petY = hudBottom + (actionsTop - hudBottom) * 0.48;
    const petScale = Phaser.Math.Clamp(Math.min(w, actionsTop - hudBottom) / 420, 0.72, 2.6);

    this.shadow = this.add.ellipse(cx, petY + 88 * petScale, 160 * petScale, 34 * petScale, 0x5a3d4a, 0.16);
    this.pet = new Pet(this, cx, petY);
    this.pet.setScale(petScale);
    this.pet.setInteractive(
      new Phaser.Geom.Ellipse(0, 10, 200, 210),
      Phaser.Geom.Ellipse.Contains,
    );
    this.pet.on("pointerup", () => this.onBoop());

    this.hearts = this.add.particles(0, 0, "heart", {
      speed: { min: 40, max: 90 },
      angle: { min: 240, max: 300 },
      lifespan: 900,
      scale: { start: 0.7, end: 0.1 },
      emitting: false,
      quantity: 1,
    });
    this.stars = this.add.particles(0, 0, "star", {
      speed: { min: 50, max: 110 },
      lifespan: 800,
      scale: { start: 0.8, end: 0.1 },
      emitting: false,
    });
    this.bubbles = this.add.particles(0, 0, "bubble", {
      speedY: { min: -80, max: -40 },
      speedX: { min: -20, max: 20 },
      lifespan: 1200,
      scale: { start: 0.7, end: 1.2 },
      emitting: false,
    });

    this.buildHud(w, safe, u, font);
    this.buildActions(w, h, safe, u, font);
    this.deathLayer = this.add.container(0, 0).setDepth(50).setVisible(false);
    this.buildDeath(w, h, cx, u, font);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tick(),
    });

    this.refresh();
    if (this.state.dead) this.showDeath();
  }

  handleResize(gameSize) {
    if (Math.abs(gameSize.width - this.layoutW) < 12 && Math.abs(gameSize.height - this.layoutH) < 12) {
      return;
    }
    this.scene.restart();
  }

  drawRoom(w, h, cx, u) {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(w * 0.16, h * 0.28, 86 * u, 44 * u);
    g.fillEllipse(w * 0.26, h * 0.28, 62 * u, 34 * u);
    g.fillEllipse(w * 0.82, h * 0.26, 96 * u, 48 * u);
    g.fillEllipse(w * 0.91, h * 0.265, 58 * u, 32 * u);

    g.fillStyle(0xfff0c2, 1);
    g.fillCircle(w * 0.15, h * 0.13, 26 * u);
    g.fillStyle(0xffe08a, 0.32);
    g.fillCircle(w * 0.15, h * 0.13, 40 * u);

    g.fillStyle(0xf8e1c4, 1);
    g.fillRoundedRect(w * 0.07, h * 0.29, 92 * u, 108 * u, 18 * u);
    g.fillStyle(0x9bd4ff, 0.85);
    g.fillRoundedRect(w * 0.07 + 10 * u, h * 0.29 + 10 * u, 72 * u, 88 * u, 12 * u);
    g.fillStyle(0xffffff, 0.35);
    g.fillRoundedRect(w * 0.07 + 14 * u, h * 0.29 + 14 * u, 28 * u, 34 * u, 6 * u);

    const floorTop = h * 0.58;
    g.fillStyle(0xffc1d8, 0.9);
    g.fillRoundedRect(0, floorTop, w, h - floorTop, 0);
    g.fillStyle(0xffd6e7, 1);
    g.fillEllipse(cx, floorTop + 8 * u, Math.min(w * 0.88, 360 * u), 70 * u);

    g.fillStyle(0x81c784, 1);
    g.fillEllipse(w * 0.12, floorTop, 70 * u, 36 * u);
    g.fillEllipse(w * 0.88, floorTop + 2 * u, 64 * u, 32 * u);
    g.fillStyle(0xf48fb1, 1);
    g.fillCircle(w * 0.12, floorTop - 22 * u, 10 * u);
    g.fillCircle(w * 0.88, floorTop - 20 * u, 9 * u);
  }

  buildHud(w, safe, u, font) {
    const top = safe.top + 8 * u;
    const cardH = 132 * u;
    const card = this.add.graphics();
    card.fillStyle(0xfff7fb, 0.92);
    card.fillRoundedRect(16 * u, top, w - 32 * u, cardH, 24 * u);

    this.nameText = this.add
      .text(32 * u, top + 12 * u, this.state.name, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(24),
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setInteractive({ useHandCursor: true });
    this.nameText.on("pointerup", () => this.rename());

    this.dayText = this.add.text(32 * u, top + 38 * u, "Día 0", {
      fontFamily: "Fredoka, sans-serif",
      fontSize: font(13),
      color: "#c97b9a",
      fontStyle: "600",
    });

    this.muteBtn = this.add
      .text(w - 36 * u, top + 12 * u, "🔊", { fontSize: font(20) })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    this.muteBtn.on("pointerup", () => {
      toggleMute();
      this.muteBtn.setText(isMuted() ? "🔇" : "🔊");
    });

    this.bars = {};
    STATS.forEach((stat, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 32 * u + col * Math.min(118 * u, (w - 64 * u) / 3);
      const y = top + 60 * u + row * 34 * u;
      this.add.text(x, y, `${stat.icon} ${stat.label}`, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(12),
        color: "#8a6574",
        fontStyle: "600",
      });
      const track = this.add.graphics();
      track.fillStyle(0xf3d6e2, 1);
      const barW = Math.min(100 * u, (w - 80 * u) / 3 - 8 * u);
      track.fillRoundedRect(x, y + 16 * u, barW, 10 * u, 5 * u);
      const fill = this.add.graphics();
      this.bars[stat.key] = { fill, color: stat.color, x, y: y + 16 * u, width: barW, thickness: 10 * u, radius: 5 * u };
    });
  }

  buildActions(w, h, safe, u, font) {
    const specs = [
      { emoji: "🍪", label: "Comer", color: 0xffd1dc, fn: () => this.doFeed() },
      { emoji: "🎾", label: "Jugar", color: 0xffe7a8, fn: () => this.doPlay() },
      { emoji: "🛁", label: "Bañar", color: 0xc5f0ee, fn: () => this.doBathe() },
      { emoji: "💊", label: "Curar", color: 0xd4f0c7, fn: () => this.doHeal() },
      { emoji: "🌙", label: "Dormir", color: 0xe4d7ff, fn: () => this.doSleep() },
    ];

    const gap = 8 * u;
    const side = Math.max(safe.left, safe.right, 16 * u);
    const available = w - side * 2;
    const bw = Math.min(84 * u, (available - gap * (specs.length - 1)) / specs.length);
    const bh = Math.max(78 * u, Math.min(92 * u, h * 0.1));
    const start = side + bw / 2;
    const y = h - safe.bottom - bh / 2 - 36 * u;

    this.actionButtons = specs.map((spec, i) =>
      makeButton(this, start + i * (bw + gap), y, bw, bh, spec.color, spec.emoji, spec.label, spec.fn),
    );

    this.hint = this.add
      .text(w / 2, h - safe.bottom - 10 * u, "Toca a Mochi para hacerle mimos", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(14),
        color: "#c97b9a",
      })
      .setOrigin(0.5, 1);

    this.sleepBtn = this.actionButtons[4];
  }

  buildDeath(w, h, cx, u, font) {
    const veil = this.add.rectangle(cx, h / 2, w, h, 0x3d2c3a, 0.42);
    const cardW = Math.min(w - 48 * u, 340 * u);
    const card = this.add.graphics();
    card.fillStyle(0xfff7fb, 0.97);
    card.fillRoundedRect(cx - cardW / 2, h * 0.3, cardW, 300 * u, 28 * u);

    const title = this.add
      .text(cx, h * 0.3 + 50 * u, "Oh no...", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(32),
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.deathMsg = this.add
      .text(cx, h * 0.3 + 110 * u, "", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: font(16),
        color: "#8a6574",
        align: "center",
        wordWrap: { width: cardW - 40 * u },
      })
      .setOrigin(0.5);

    const again = makePill(this, cx, h * 0.3 + 220 * u, Math.min(240 * u, cardW - 40 * u), 58 * u, 0xffd1dc, "Nueva mascota 🌸", () => {
      sfxTap();
      clearState();
      this.state = createDefaultState();
      saveState(this.state);
      this.deathLayer.setVisible(false);
      this.pet.clearDeadEyes();
      this.refresh();
    });

    this.deathLayer.add([veil, card, title, this.deathMsg, again]);
  }

  rename() {
    const next = window.prompt("¿Cómo se llama tu mascota?", this.state.name);
    if (!next) return;
    const name = next.trim().slice(0, 12);
    if (!name) return;
    this.state.name = name;
    saveState(this.state);
    this.nameText.setText(name);
  }

  tick() {
    applyElapsed(this.state);
    saveState(this.state);
    this.refresh();
    if (this.state.dead) this.showDeath();
  }

  refresh() {
    const mood = getMood(this.state);
    this.pet.setMood(mood);
    this.nameText.setText(this.state.name);
    this.dayText.setText(`Día ${ageInDays(this.state)}`);

    STATS.forEach((stat) => {
      const bar = this.bars[stat.key];
      const value = this.state.stats[stat.key];
      bar.fill.clear();
      bar.fill.fillStyle(stat.color, 1);
      bar.fill.fillRoundedRect(bar.x, bar.y, Math.max(8, bar.width * (value / 100)), bar.thickness, bar.radius);
    });

    this.sleepBtn.labelText.setText(this.state.sleeping ? "Despertar" : "Dormir");
    this.sleepBtn.emojiText.setText(this.state.sleeping ? "☀️" : "🌙");

    this.hint.setText(
      this.state.sleeping
        ? "Shhh... está soñando 💤"
        : "Toca a Mochi para hacerle mimos",
    );
  }

  showDeath() {
    if (this.deathLayer.visible) return;
    sfxSad();
    this.deathMsg.setText(
      `${this.state.name} se puso muy malito.\nCuida mejor a tu próxima mascota: comida, cariño, baño y medicina.`,
    );
    this.deathLayer.setVisible(true);
  }

  burst(emitter, x, y, count) {
    emitter.setPosition(x, y);
    emitter.explode(count);
  }

  onBoop() {
    const result = boop(this.state);
    if (!result.ok) {
      if (this.state.sleeping) toast(this, "Está dormidito... 💤");
      return;
    }
    sfxBoop();
    this.pet.squash();
    this.burst(this.hearts, this.pet.x, this.pet.y - 40, 5);
    saveState(this.state);
    this.refresh();
    toast(this, result.message);
  }

  doFeed() {
    const result = feed(this.state);
    if (!result.ok) {
      sfxDeny();
      toast(this, result.message);
      return;
    }
    sfxFeed();
    this.pet.squash();
    this.burst(this.hearts, this.pet.x, this.pet.y - 20, 4);
    saveState(this.state);
    this.refresh();
    toast(this, result.message);
  }

  doPlay() {
    const result = play(this.state);
    if (!result.ok) {
      sfxDeny();
      toast(this, result.message);
      return;
    }
    sfxPlay();
    this.pet.jump();
    this.burst(this.stars, this.pet.x, this.pet.y - 10, 10);
    saveState(this.state);
    this.refresh();
    toast(this, result.message);
  }

  doBathe() {
    const result = bathe(this.state);
    if (!result.ok) {
      sfxDeny();
      toast(this, result.message);
      return;
    }
    sfxBath();
    this.burst(this.bubbles, this.pet.x, this.pet.y + 30, 14);
    saveState(this.state);
    this.refresh();
    toast(this, result.message);
  }

  doHeal() {
    const result = heal(this.state);
    if (!result.ok) {
      sfxDeny();
      toast(this, result.message);
      return;
    }
    sfxHeal();
    this.burst(this.stars, this.pet.x, this.pet.y, 8);
    saveState(this.state);
    this.refresh();
    toast(this, result.message);
  }

  doSleep() {
    const result = toggleSleep(this.state);
    if (!result.ok) {
      sfxDeny();
      toast(this, result.message);
      return;
    }
    sfxSleep();
    saveState(this.state);
    this.refresh();
    toast(this, result.message);
  }

  update(time) {
    this.pet.blink(time);
    const pointer = this.input.activePointer;
    if (pointer && (pointer.x !== 0 || pointer.y !== 0)) {
      this.pet.lookAt(pointer);
    }
    const tired = this.state.stats.energia < 18 && !this.state.sleeping && !this.state.dead;
    this.shadow.setScale(tired ? 0.85 : 1, 1);
  }
}
