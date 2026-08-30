import Phaser from "phaser";
import { SPECIES, normalizeSpecies } from "../species.js";

const PUPIL_COLOR = 0x3d2c3a;
const ARM_LEFT = { x: -78, y: 52, angle: -22 };
const ARM_RIGHT = { x: 78, y: 52, angle: 22 };

export class Pet extends Phaser.GameObjects.Container {
  constructor(scene, x, y, species = "tlacuache") {
    super(scene, x, y);
    scene.add.existing(this);
    this.displayScale = 1;
    this.mood = "happy";
    this.species = normalizeSpecies(species);
    this.blinkUntil = 0;
    this.nextBlink = scene.time.now + 1800;
    this.acting = false;
    this.actionTimers = [];
    this.zzzEvent = null;
    this.zzzs = [];
    this.onActionDone = null;

    this.bathBack = scene.add.graphics();
    this.backExtras = scene.add.graphics();
    this.body = scene.add.image(0, 8, SPECIES[this.species].bodyKey).setDisplaySize(210, 210);
    this.spots = scene.add.graphics();
    this.frontExtras = scene.add.graphics();
    this.leftArm = scene.add.ellipse(ARM_LEFT.x, ARM_LEFT.y, 38, 22, 0xc4b8aa).setAngle(ARM_LEFT.angle);
    this.rightArm = scene.add.ellipse(ARM_RIGHT.x, ARM_RIGHT.y, 38, 22, 0xc4b8aa).setAngle(ARM_RIGHT.angle);
    this.frontArm = scene.add.ellipse(ARM_RIGHT.x, ARM_RIGHT.y, 42, 24, 0xc4b8aa).setAngle(ARM_RIGHT.angle).setVisible(false);
    this.leftBlush = scene.add.ellipse(-46, 28, 28, 16, 0xff8fab, 0.55);
    this.rightBlush = scene.add.ellipse(46, 28, 28, 16, 0xff8fab, 0.55);

    this.leftEyeWhite = scene.add.ellipse(-28, -8, 38, 44, 0xffffff);
    this.rightEyeWhite = scene.add.ellipse(28, -8, 38, 44, 0xffffff);
    this.leftPupil = scene.add.ellipse(-28, -4, 18, 22, PUPIL_COLOR);
    this.rightPupil = scene.add.ellipse(28, -4, 18, 22, PUPIL_COLOR);
    this.leftShine = scene.add.ellipse(-34, -14, 8, 10, 0xffffff);
    this.rightShine = scene.add.ellipse(22, -14, 8, 10, 0xffffff);
    this.leftLid = scene.add.ellipse(-28, -8, 40, 46, 0xcfc4b8).setVisible(false);
    this.rightLid = scene.add.ellipse(28, -8, 40, 46, 0xcfc4b8).setVisible(false);

    this.mouth = scene.add.graphics();
    this.sleepEyes = scene.add.graphics();
    this.propLayer = scene.add.container(0, 0);
    this.bathFront = scene.add.graphics();

    this.cookie = scene.add.image(70, 36, "cookie").setDisplaySize(52, 52).setVisible(false);
    this.ball = scene.add.image(90, 20, "ball").setDisplaySize(40, 40).setVisible(false);
    this.pill = scene.add.image(70, 8, "pill").setDisplaySize(38, 22).setVisible(false);
    this.soap = scene.add.image(8, -70, "soap").setDisplaySize(36, 24).setVisible(false);
    this.duck = scene.add.image(78, 78, "duck").setDisplaySize(48, 44).setVisible(false);
    this.propLayer.add([this.cookie, this.ball, this.pill, this.soap, this.duck]);

    this.add([
      this.bathBack,
      this.backExtras,
      this.leftArm,
      this.rightArm,
      this.body,
      this.spots,
      this.frontExtras,
      this.leftBlush,
      this.rightBlush,
      this.leftEyeWhite,
      this.rightEyeWhite,
      this.leftPupil,
      this.rightPupil,
      this.leftShine,
      this.rightShine,
      this.leftLid,
      this.rightLid,
      this.mouth,
      this.sleepEyes,
      this.frontArm,
      this.propLayer,
      this.bathFront,
    ]);

    this.setSize(200, 210);
    this.applySpeciesLook();
    this.drawMouth("happy");
    this.startIdle();
  }

  setSpecies(species) {
    this.species = normalizeSpecies(species);
    this.applySpeciesLook();
  }

  applySpeciesLook() {
    const spec = SPECIES[this.species];
    this.leftArm.setFillStyle(spec.armColor);
    this.rightArm.setFillStyle(spec.armColor);
    this.frontArm.setFillStyle(spec.armColor);
    this.leftLid.setFillStyle(spec.lidColor);
    this.rightLid.setFillStyle(spec.lidColor);
    this.applyBodyTexture();
    this.drawSpeciesFeatures();
  }

  applyBodyTexture() {
    const spec = SPECIES[this.species];
    this.body.setTexture(this.mood === "sick" ? spec.sickKey : spec.bodyKey);
  }

  setDisplayScale(scale) {
    this.displayScale = scale;
    this.setScale(scale);
    if (!this.acting) this.startIdle();
  }

  startIdle() {
    this.idleTween?.stop();
    const s = this.displayScale;
    this.idleTween = this.scene.tweens.add({
      targets: this,
      scaleY: s * 1.035,
      scaleX: s * 0.985,
      yoyo: true,
      duration: this.mood === "sleep" ? 1400 : 900,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.armTween?.stop();
    this.leftArm.setPosition(ARM_LEFT.x, ARM_LEFT.y).setAngle(ARM_LEFT.angle);
    this.rightArm.setPosition(ARM_RIGHT.x, ARM_RIGHT.y).setAngle(ARM_RIGHT.angle);
    this.armTween = this.scene.tweens.add({
      targets: [this.leftArm, this.rightArm],
      y: "+=5",
      yoyo: true,
      duration: 900,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  drawSpeciesFeatures() {
    const back = this.backExtras;
    const front = this.frontExtras;
    back.clear();
    front.clear();

    if (this.species === "tlacuache") {
      back.fillStyle(0xd8b4b4, 1);
      back.fillEllipse(82, 68, 92, 22);
      back.fillStyle(0xe8c4c4, 1);
      back.fillCircle(124, 54, 11);

      back.fillStyle(0xb8a898, 1);
      back.fillEllipse(-42, -88, 36, 50);
      back.fillEllipse(42, -88, 36, 50);
      back.fillStyle(0xffb3c6, 1);
      back.fillEllipse(-42, -86, 18, 28);
      back.fillEllipse(42, -86, 18, 28);

      front.fillStyle(0xff8fab, 1);
      front.fillEllipse(0, 22, 16, 12);
      front.fillStyle(0xffc1d8, 1);
      front.fillCircle(-3, 20, 3);
      return;
    }

    back.fillStyle(0xe8d5c4, 1);
    back.fillEllipse(-36, 94, 22, 28);
    back.fillEllipse(-12, 98, 20, 26);
    back.fillEllipse(12, 98, 20, 26);
    back.fillEllipse(36, 94, 22, 28);

    back.fillStyle(0xe8d5c4, 1);
    back.fillEllipse(-38, -78, 22, 32);
    back.fillEllipse(38, -78, 22, 32);
    back.fillStyle(0xffcbb8, 1);
    back.fillEllipse(-38, -78, 12, 20);
    back.fillEllipse(38, -78, 12, 20);

    front.fillStyle(0x5a3d4a, 1);
    front.fillEllipse(0, 22, 8, 6);
  }

  drawMouth(mood) {
    const g = this.mouth;
    g.clear();
    g.lineStyle(3.5, 0x5a3d4a, 1);

    if (mood === "sleep" || mood === "dead") {
      return;
    }
    if (mood === "eat") {
      g.fillStyle(0x5a3d4a, 1);
      g.fillEllipse(0, 44, 18, 20);
      g.fillStyle(0xff8fab, 1);
      g.fillEllipse(0, 50, 10, 7);
      return;
    }
    if (mood === "chew") {
      g.lineStyle(4, 0x5a3d4a, 1);
      g.beginPath();
      g.moveTo(-10, 42);
      g.lineTo(10, 42);
      g.strokePath();
      return;
    }
    if (mood === "happy") {
      g.beginPath();
      g.arc(0, 38, 12, 0.15, Math.PI - 0.15, false);
      g.strokePath();
      return;
    }
    if (mood === "sad" || mood === "hungry") {
      g.beginPath();
      g.arc(0, 48, 10, Math.PI + 0.3, -0.3, false);
      g.strokePath();
      return;
    }
    if (mood === "sick") {
      g.lineStyle(3, 0x5a3d4a, 1);
      g.beginPath();
      g.moveTo(-8, 42);
      g.lineTo(8, 42);
      g.strokePath();
      g.fillStyle(0x81c784, 0.35);
      g.fillEllipse(0, 54, 16, 10);
      return;
    }
    if (mood === "tired") {
      g.beginPath();
      g.moveTo(-9, 42);
      g.lineTo(9, 42);
      g.strokePath();
      return;
    }
    g.beginPath();
    g.arc(0, 40, 8, 0.2, Math.PI - 0.2, false);
    g.strokePath();
  }

  drawSpots(show) {
    const g = this.spots;
    g.clear();
    if (!show) return;
    g.fillStyle(0xc48b6a, 0.45);
    g.fillCircle(-40, 36, 10);
    g.fillCircle(48, 18, 8);
    g.fillCircle(-10, 62, 7);
    g.fillCircle(30, 58, 6);
  }

  setMood(mood) {
    if (this.acting) return;
    if (this.mood === mood) {
      this.drawMouth(mood);
      if (mood === "sleep") this.startZzz();
      else this.stopZzz();
      return;
    }
    this.mood = mood;
    this.applyBodyTexture();
    this.drawMouth(mood);
    this.drawSpots(mood === "dirty");
    this.drawSleepEyes(mood === "sleep");

    const sleeping = mood === "sleep";
    const dead = mood === "dead";
    this.leftEyeWhite.setVisible(!sleeping && !dead);
    this.rightEyeWhite.setVisible(!sleeping && !dead);
    this.leftPupil.setVisible(!sleeping && !dead);
    this.rightPupil.setVisible(!sleeping && !dead);
    this.leftShine.setVisible(!sleeping && !dead);
    this.leftLid.setVisible(false);
    this.rightLid.setVisible(false);
    this.rightShine.setVisible(!sleeping && !dead);

    if (dead) {
      this.drawDeadEyes();
    } else {
      this.clearDeadEyes();
    }

    if (sleeping) this.startZzz();
    else this.stopZzz();

    this.startIdle();
  }

  drawSleepEyes(show) {
    const g = this.sleepEyes;
    g.clear();
    if (!show) return;
    g.lineStyle(4, 0x5a3d4a, 1);
    g.beginPath();
    g.arc(-28, -4, 11, 0.2, Math.PI - 0.2, false);
    g.strokePath();
    g.beginPath();
    g.arc(28, -4, 11, 0.2, Math.PI - 0.2, false);
    g.strokePath();
  }

  drawDeadEyes() {
    this.clearDeadEyes();
    const g = this.scene.add.graphics();
    g.lineStyle(4, 0x5a3d4a, 1);
    g.lineBetween(-38, -18, -18, 2);
    g.lineBetween(-18, -18, -38, 2);
    g.lineBetween(18, -18, 38, 2);
    g.lineBetween(38, -18, 18, 2);
    g.setName("dead-eyes");
    this.add(g);
    this.deadEyes = g;
    this.leftEyeWhite.setVisible(false);
    this.rightEyeWhite.setVisible(false);
  }

  clearDeadEyes() {
    this.deadEyes?.destroy();
    this.deadEyes = undefined;
  }

  lookAt(pointer) {
    if (this.acting || this.mood === "sleep" || this.mood === "dead") return;
    const dx = Phaser.Math.Clamp((pointer.x - this.x) / 90, -1, 1);
    const dy = Phaser.Math.Clamp((pointer.y - this.y) / 110, -1, 1);
    this.setPupils(dx, dy);
  }

  lookAtLocal(lx, ly) {
    const dx = Phaser.Math.Clamp(lx / 90, -1, 1);
    const dy = Phaser.Math.Clamp(ly / 110, -1, 1);
    this.setPupils(dx, dy);
  }

  setPupils(dx, dy) {
    this.leftPupil.setPosition(-28 + dx * 6, -4 + dy * 6);
    this.rightPupil.setPosition(28 + dx * 6, -4 + dy * 6);
    this.leftShine.setPosition(-34 + dx * 6, -14 + dy * 6);
    this.rightShine.setPosition(22 + dx * 6, -14 + dy * 6);
  }

  blink(time) {
    if (this.acting || this.mood === "sleep" || this.mood === "dead") return;
    if (time > this.nextBlink) {
      this.leftLid.setVisible(true);
      this.rightLid.setVisible(true);
      this.blinkUntil = time + 120;
      this.nextBlink = time + 2200 + Math.random() * 2500;
    }
    if (this.blinkUntil && time > this.blinkUntil) {
      this.leftLid.setVisible(false);
      this.rightLid.setVisible(false);
      this.blinkUntil = 0;
    }
  }

  squash() {
    const s = this.displayScale;
    this.scene.tweens.add({
      targets: this,
      scaleX: s * 1.12,
      scaleY: s * 0.88,
      duration: 90,
      yoyo: true,
      ease: "Sine.out",
    });
  }

  jump() {
    const baseY = this.y;
    this.scene.tweens.add({
      targets: this,
      y: baseY - 42,
      duration: 220,
      yoyo: true,
      ease: "Cubic.out",
    });
  }

  shake() {
    this.scene.tweens.add({
      targets: this,
      x: this.x + 6,
      duration: 50,
      yoyo: true,
      repeat: 4,
    });
  }

  beginAction(onDone) {
    if (this.acting) return false;
    this.acting = true;
    this.onActionDone = onDone || null;
    this.idleTween?.stop();
    this.armTween?.stop();
    this.clearActionTimers();
    this.scene.tweens.killTweensOf([
      this,
      this.cookie,
      this.ball,
      this.pill,
      this.soap,
      this.duck,
      this.frontArm,
      this.leftArm,
      this.rightArm,
      this.bathBack,
      this.bathFront,
    ]);
    this.setScale(this.displayScale);
    this.hideProps();
    this.drawBath(false);
    return true;
  }

  clearActionTimers() {
    for (const timer of this.actionTimers) timer.remove(false);
    this.actionTimers = [];
  }

  finishAction() {
    this.clearActionTimers();
    this.scene.tweens.killTweensOf([
      this.cookie,
      this.ball,
      this.pill,
      this.soap,
      this.duck,
      this.frontArm,
      this.leftArm,
      this.rightArm,
      this.bathBack,
      this.bathFront,
    ]);
    this.hideProps();
    this.drawBath(false);
    this.frontArm.setVisible(false);
    this.rightArm.setVisible(true);
    this.leftArm.setVisible(true);
    this.body.clearTint();
    this.restoreHomeY();
    this.acting = false;
    this.startIdle();
    const done = this.onActionDone;
    this.onActionDone = null;
    done?.();
  }

  hideProps() {
    this.cookie.setVisible(false).setAlpha(1).setDisplaySize(52, 52);
    this.ball.setVisible(false).setAlpha(1).setDisplaySize(40, 40);
    this.pill.setVisible(false).setAlpha(1).setAngle(0).setDisplaySize(38, 22);
    this.soap.setVisible(false).setAlpha(1).setDisplaySize(36, 24);
    this.duck.setVisible(false).setAlpha(1).setDisplaySize(48, 44);
  }

  later(delay, fn) {
    const timer = this.scene.time.delayedCall(delay, fn);
    this.actionTimers.push(timer);
    return timer;
  }

  restoreHomeY() {
    if (this.homeY != null) {
      this.y = this.homeY;
    }
  }

  actEat(onDone) {
    if (!this.beginAction(onDone)) return;
    this.homeY = this.y;
    this.rightArm.setVisible(false);
    this.frontArm.setVisible(true).setPosition(64, 52).setAngle(32);
    this.cookie.setVisible(true).setPosition(80, 40).setDisplaySize(52, 52);
    this.lookAtLocal(80, 40);

    this.scene.tweens.add({
      targets: this.frontArm,
      x: 38,
      y: 42,
      angle: -12,
      duration: 380,
      ease: "Back.out",
    });
    this.scene.tweens.add({
      targets: this.cookie,
      x: 10,
      y: 36,
      duration: 380,
      ease: "Back.out",
      onUpdate: () => this.lookAtLocal(this.cookie.x, this.cookie.y),
    });

    this.later(380, () => {
      this.drawMouth("eat");
      this.chewTimes(4, () => {
        this.cookie.setVisible(false);
        this.drawMouth("happy");
        this.scene.tweens.add({
          targets: this,
          scaleX: this.displayScale * 1.1,
          scaleY: this.displayScale * 0.9,
          duration: 120,
          yoyo: true,
        });
        this.later(280, () => this.finishAction());
      });
    });
  }

  chewTimes(times, onDone) {
    if (times <= 0) {
      onDone();
      return;
    }
    this.drawMouth("eat");
    this.spawnCrumbs();
    this.scene.tweens.add({
      targets: this.cookie,
      scaleX: this.cookie.scaleX * 0.8,
      scaleY: this.cookie.scaleY * 0.8,
      duration: 160,
      onComplete: () => {
        this.drawMouth("chew");
        this.later(90, () => this.chewTimes(times - 1, onDone));
      },
    });
  }

  spawnCrumbs() {
    for (let i = 0; i < 3; i += 1) {
      const crumb = this.scene.add.image(this.cookie.x + Phaser.Math.Between(-8, 10), this.cookie.y + 8, "crumb");
      crumb.setDisplaySize(8, 8);
      this.propLayer.add(crumb);
      this.scene.tweens.add({
        targets: crumb,
        y: crumb.y + Phaser.Math.Between(28, 50),
        x: crumb.x + Phaser.Math.Between(-18, 18),
        alpha: 0,
        duration: 420,
        onComplete: () => crumb.destroy(),
      });
    }
  }

  actBathe(onDone) {
    if (!this.beginAction(onDone)) return;
    this.homeY = this.y;
    this.drawSpots(false);
    this.drawBath(true);
    this.duck.setVisible(true).setPosition(82, 86).setAlpha(1);
    this.soap.setVisible(true).setPosition(-16, -92).setAlpha(1);

    this.scene.tweens.add({
      targets: this,
      y: this.homeY + 22,
      duration: 280,
      ease: "Sine.out",
    });
    this.scene.tweens.add({
      targets: this.soap,
      x: 6,
      y: -78,
      duration: 500,
      ease: "Bounce.out",
    });
    this.scene.tweens.add({
      targets: this.duck,
      y: 80,
      angle: 8,
      yoyo: true,
      duration: 380,
      repeat: 4,
      ease: "Sine.inOut",
    });
    this.scene.tweens.add({
      targets: this.leftArm,
      angle: -58,
      y: 38,
      duration: 160,
      yoyo: true,
      repeat: 7,
    });
    this.scene.tweens.add({
      targets: this.rightArm,
      angle: 58,
      y: 38,
      duration: 160,
      delay: 80,
      yoyo: true,
      repeat: 7,
    });
    this.scene.tweens.add({
      targets: this.soap,
      x: 28,
      duration: 280,
      yoyo: true,
      delay: 500,
      repeat: 3,
    });

    this.later(2000, () => {
      this.scene.tweens.add({
        targets: this,
        y: this.homeY - 16,
        duration: 220,
        ease: "Back.out",
        onComplete: () => {
          this.scene.tweens.add({
            targets: this,
            y: this.homeY,
            duration: 180,
          });
        },
      });
      this.scene.tweens.add({
        targets: [this.bathBack, this.bathFront, this.duck, this.soap],
        alpha: 0,
        duration: 280,
      });
      this.later(360, () => this.finishAction());
    });
  }

  drawBath(show) {
    const back = this.bathBack;
    const front = this.bathFront;
    back.clear();
    front.clear();
    back.setAlpha(1);
    front.setAlpha(1);
    if (!show) return;

    back.fillStyle(0xffd6e7, 1);
    back.fillRoundedRect(-118, 28, 236, 110, 48);
    back.fillStyle(0x7ec8e3, 0.88);
    back.fillEllipse(0, 62, 200, 56);
    back.fillStyle(0xffffff, 0.55);
    back.fillCircle(-48, 54, 10);
    back.fillCircle(-18, 48, 14);
    back.fillCircle(22, 50, 9);
    back.fillCircle(52, 56, 12);

    front.fillStyle(0xffb3c6, 1);
    front.fillRoundedRect(-122, 78, 244, 62, 30);
    front.fillStyle(0xffc1d8, 1);
    front.fillRoundedRect(-112, 86, 224, 44, 22);
    front.fillStyle(0x6ec6d6, 0.55);
    front.fillEllipse(0, 84, 196, 28);
    front.fillStyle(0xffffff, 0.35);
    front.fillEllipse(-40, 80, 40, 10);
  }

  actPlay(onDone) {
    if (!this.beginAction(onDone)) return;
    this.homeY = this.y;
    this.ball.setVisible(true).setPosition(96, 8).setAlpha(1);
    this.lookAtLocal(96, 8);

    this.scene.tweens.add({
      targets: this.leftArm,
      angle: -48,
      y: 36,
      duration: 140,
      yoyo: true,
      repeat: 6,
    });
    this.scene.tweens.add({
      targets: this.rightArm,
      angle: 48,
      y: 36,
      duration: 140,
      delay: 70,
      yoyo: true,
      repeat: 6,
    });

    this.scene.tweens.add({
      targets: this.ball,
      x: { from: 96, to: -70 },
      y: { from: 8, to: -70 },
      duration: 420,
      yoyo: true,
      repeat: 1,
      ease: "Sine.inOut",
      onUpdate: () => this.lookAtLocal(this.ball.x, this.ball.y),
    });

    const baseY = this.y;
    this.scene.tweens.add({
      targets: this,
      y: baseY - 38,
      duration: 240,
      yoyo: true,
      repeat: 2,
      ease: "Cubic.out",
    });

    this.later(1500, () => {
      this.scene.tweens.add({
        targets: this.ball,
        alpha: 0,
        scale: 0.4,
        duration: 180,
      });
      this.later(200, () => this.finishAction());
    });
  }

  actHeal(onDone) {
    if (!this.beginAction(onDone)) return;
    this.homeY = this.y;
    this.rightArm.setVisible(false);
    this.frontArm.setVisible(true).setPosition(60, 20).setAngle(-8);
    this.pill.setVisible(true).setPosition(68, 2).setAngle(-20);
    this.lookAtLocal(68, 2);

    this.scene.tweens.add({
      targets: this.frontArm,
      x: 36,
      y: 30,
      duration: 320,
      ease: "Sine.out",
    });
    this.scene.tweens.add({
      targets: this.pill,
      x: 8,
      y: 28,
      angle: 0,
      duration: 320,
      ease: "Sine.out",
      onUpdate: () => this.lookAtLocal(this.pill.x, this.pill.y),
    });

    this.later(320, () => {
      this.drawMouth("eat");
      this.scene.tweens.add({
        targets: this.pill,
        scale: 0.2,
        alpha: 0,
        duration: 180,
      });
      this.later(180, () => {
        this.drawMouth("happy");
        this.body.setTint(0xd4f8c8);
        this.spawnPluses();
        this.scene.tweens.add({
          targets: this,
          scaleX: this.displayScale * 1.08,
          scaleY: this.displayScale * 0.94,
          duration: 140,
          yoyo: true,
        });
        this.later(500, () => {
          this.body.clearTint();
          this.finishAction();
        });
      });
    });
  }

  spawnPluses() {
    for (let i = 0; i < 5; i += 1) {
      const plus = this.scene.add.image(Phaser.Math.Between(-40, 40), Phaser.Math.Between(-10, 40), "plus");
      plus.setDisplaySize(16, 16);
      this.propLayer.add(plus);
      this.scene.tweens.add({
        targets: plus,
        y: plus.y - 50,
        alpha: 0,
        duration: 700,
        delay: i * 70,
        onComplete: () => plus.destroy(),
      });
    }
  }

  startZzz() {
    if (this.zzzEvent) return;
    this.spawnZzz();
    this.zzzEvent = this.scene.time.addEvent({
      delay: 780,
      loop: true,
      callback: () => this.spawnZzz(),
    });
  }

  stopZzz() {
    this.zzzEvent?.remove(false);
    this.zzzEvent = null;
    for (const z of this.zzzs) z.destroy();
    this.zzzs = [];
  }

  spawnZzz() {
    if (this.mood !== "sleep") return;
    const label = this.zzzs.length % 2 === 0 ? "z" : "Z";
    const z = this.scene.add.text(36, -62, label, {
      fontFamily: "Fredoka, sans-serif",
      fontSize: "26px",
      color: "#9b7bb8",
      fontStyle: "700",
    });
    z.setOrigin(0.5);
    this.add(z);
    this.zzzs.push(z);
    this.scene.tweens.add({
      targets: z,
      y: -130,
      x: 78,
      alpha: 0,
      scale: 1.35,
      duration: 1500,
      ease: "Sine.out",
      onComplete: () => {
        z.destroy();
        this.zzzs = this.zzzs.filter((item) => item !== z);
      },
    });
  }
}
