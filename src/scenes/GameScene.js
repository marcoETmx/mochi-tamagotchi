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
import { H, W, makeButton, makePill, toast } from "../ui.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("game");
  }

  create() {
    this.state = loadState() || createDefaultState();
    applyElapsed(this.state);
    saveState(this.state);

    this.add.image(W / 2, H / 2, "sky");
    this.drawRoom();

    this.shadow = this.add.ellipse(W / 2, 478, 160, 34, 0x5a3d4a, 0.16);
    this.pet = new Pet(this, W / 2, 390);
    this.pet.setInteractive(
      new Phaser.Geom.Ellipse(0, 10, 180, 190),
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

    this.buildHud();
    this.buildActions();
    this.deathLayer = this.add.container(0, 0).setDepth(50).setVisible(false);
    this.buildDeath();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tick(),
    });

    this.refresh();
    if (this.state.dead) this.showDeath();
  }

  drawRoom() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(64, 236, 86, 44);
    g.fillEllipse(102, 236, 62, 34);
    g.fillEllipse(318, 218, 96, 48);
    g.fillEllipse(354, 222, 58, 32);

    g.fillStyle(0xfff0c2, 1);
    g.fillCircle(58, 108, 26);
    g.fillStyle(0xffe08a, 0.32);
    g.fillCircle(58, 108, 40);

    g.fillStyle(0xf8e1c4, 1);
    g.fillRoundedRect(28, 248, 92, 108, 18);
    g.fillStyle(0x9bd4ff, 0.85);
    g.fillRoundedRect(38, 258, 72, 88, 12);
    g.fillStyle(0xffffff, 0.35);
    g.fillRoundedRect(42, 262, 28, 34, 6);

    g.fillStyle(0xffc1d8, 0.9);
    g.fillRoundedRect(0, 500, W, 360, 0);
    g.fillStyle(0xffd6e7, 1);
    g.fillEllipse(W / 2, 508, 340, 70);

    g.fillStyle(0x81c784, 1);
    g.fillEllipse(48, 500, 70, 36);
    g.fillEllipse(342, 502, 64, 32);
    g.fillStyle(0xf48fb1, 1);
    g.fillCircle(48, 478, 10);
    g.fillCircle(342, 480, 9);
  }

  buildHud() {
    const card = this.add.graphics();
    card.fillStyle(0xfff7fb, 0.92);
    card.fillRoundedRect(16, 18, W - 32, 132, 24);

    this.nameText = this.add
      .text(32, 30, this.state.name, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "24px",
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setInteractive({ useHandCursor: true });
    this.nameText.on("pointerup", () => this.rename());

    this.dayText = this.add.text(32, 56, "Día 0", {
      fontFamily: "Fredoka, sans-serif",
      fontSize: "13px",
      color: "#c97b9a",
      fontStyle: "600",
    });

    this.muteBtn = this.add
      .text(W - 36, 30, "🔊", { fontSize: "20px" })
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
      const x = 32 + col * 118;
      const y = 78 + row * 34;
      this.add.text(x, y, `${stat.icon} ${stat.label}`, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "12px",
        color: "#8a6574",
        fontStyle: "600",
      });
      const track = this.add.graphics();
      track.fillStyle(0xf3d6e2, 1);
      track.fillRoundedRect(x, y + 16, 100, 10, 5);
      const fill = this.add.graphics();
      this.bars[stat.key] = { fill, color: stat.color, x, y: y + 16 };
    });
  }

  buildActions() {
    const specs = [
      { emoji: "🍪", label: "Comer", color: 0xffd1dc, fn: () => this.doFeed() },
      { emoji: "🎾", label: "Jugar", color: 0xffe7a8, fn: () => this.doPlay() },
      { emoji: "🛁", label: "Bañar", color: 0xc5f0ee, fn: () => this.doBathe() },
      { emoji: "💊", label: "Curar", color: 0xd4f0c7, fn: () => this.doHeal() },
      { emoji: "🌙", label: "Dormir", color: 0xe4d7ff, fn: () => this.doSleep() },
    ];

    this.actionButtons = specs.map((spec, i) => {
      const gap = 12;
      const bw = 66;
      const total = specs.length * bw + (specs.length - 1) * gap;
      const start = (W - total) / 2 + bw / 2;
      const x = start + i * (bw + gap);
      const btn = makeButton(this, x, 732, bw, 82, spec.color, spec.emoji, spec.label, spec.fn);
      return btn;
    });

    this.hint = this.add
      .text(W / 2, 800, "Toca a Mochi para hacerle mimos", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "14px",
        color: "#c97b9a",
      })
      .setOrigin(0.5);

    this.sleepBtn = this.actionButtons[4];
  }

  buildDeath() {
    const veil = this.add.rectangle(W / 2, H / 2, W, H, 0x3d2c3a, 0.42);
    const card = this.add.graphics();
    card.fillStyle(0xfff7fb, 0.97);
    card.fillRoundedRect(36, 250, W - 72, 300, 28);

    const title = this.add
      .text(W / 2, 300, "Oh no...", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "32px",
        color: "#5a3d4a",
        fontStyle: "700",
      })
      .setOrigin(0.5);

    this.deathMsg = this.add
      .text(W / 2, 360, "", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "16px",
        color: "#8a6574",
        align: "center",
        wordWrap: { width: 260 },
      })
      .setOrigin(0.5);

    const again = makePill(this, W / 2, 470, 220, 58, 0xffd1dc, "Nueva mascota 🌸", () => {
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
      bar.fill.fillRoundedRect(bar.x, bar.y, Math.max(8, 100 * (value / 100)), 10, 5);
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
