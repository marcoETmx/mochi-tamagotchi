import Phaser from "phaser";

const PUPIL_COLOR = 0x3d2c3a;

export class Pet extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);
    this.mood = "happy";
    this.blinkUntil = 0;
    this.nextBlink = scene.time.now + 1800;

    this.body = scene.add.image(0, 8, "pet-body").setDisplaySize(210, 210);
    this.spots = scene.add.graphics();
    this.sprout = scene.add.graphics();
    this.leftArm = scene.add.ellipse(-78, 52, 38, 22, 0xffb3d1).setAngle(-22);
    this.rightArm = scene.add.ellipse(78, 52, 38, 22, 0xffb3d1).setAngle(22);
    this.leftBlush = scene.add.ellipse(-46, 28, 28, 16, 0xff8fab, 0.55);
    this.rightBlush = scene.add.ellipse(46, 28, 28, 16, 0xff8fab, 0.55);

    this.leftEyeWhite = scene.add.ellipse(-28, -8, 38, 44, 0xffffff);
    this.rightEyeWhite = scene.add.ellipse(28, -8, 38, 44, 0xffffff);
    this.leftPupil = scene.add.ellipse(-28, -4, 18, 22, PUPIL_COLOR);
    this.rightPupil = scene.add.ellipse(28, -4, 18, 22, PUPIL_COLOR);
    this.leftShine = scene.add.ellipse(-34, -14, 8, 10, 0xffffff);
    this.rightShine = scene.add.ellipse(22, -14, 8, 10, 0xffffff);
    this.leftLid = scene.add.ellipse(-28, -8, 40, 46, 0xffb3d1).setVisible(false);
    this.rightLid = scene.add.ellipse(28, -8, 40, 46, 0xffb3d1).setVisible(false);

    this.mouth = scene.add.graphics();
    this.sleepEyes = scene.add.graphics();
    this.zzzs = [];

    this.add([
      this.sprout,
      this.leftArm,
      this.rightArm,
      this.body,
      this.spots,
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
    ]);

    this.setSize(200, 210);
    this.drawSprout();
    this.drawMouth("happy");
    this.startIdle();
  }

  startIdle() {
    this.idleTween?.stop();
    this.idleTween = this.scene.tweens.add({
      targets: this,
      scaleY: 1.035,
      scaleX: 0.985,
      yoyo: true,
      duration: this.mood === "sleep" ? 1400 : 900,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.armTween?.stop();
    this.armTween = this.scene.tweens.add({
      targets: [this.leftArm, this.rightArm],
      y: "+=5",
      yoyo: true,
      duration: 900,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  drawSprout() {
    const g = this.sprout;
    g.clear();
    g.fillStyle(0x81c784, 1);
    g.fillEllipse(0, -102, 18, 28);
    g.fillStyle(0xaed581, 1);
    g.fillEllipse(-16, -108, 22, 14);
    g.fillEllipse(16, -108, 22, 14);
    g.fillStyle(0xff8fab, 1);
    g.fillCircle(0, -118, 5);
  }

  drawMouth(mood) {
    const g = this.mouth;
    g.clear();
    g.lineStyle(3.5, 0x5a3d4a, 1);

    if (mood === "sleep" || mood === "dead") {
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
    if (this.mood === mood) {
      this.drawMouth(mood);
      return;
    }
    this.mood = mood;
    this.body.setTexture(mood === "sick" ? "pet-body-sick" : "pet-body");
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
    if (this.mood === "sleep" || this.mood === "dead") return;
    const dx = Phaser.Math.Clamp((pointer.x - this.x) / 90, -1, 1);
    const dy = Phaser.Math.Clamp((pointer.y - this.y) / 110, -1, 1);
    this.leftPupil.setPosition(-28 + dx * 6, -4 + dy * 6);
    this.rightPupil.setPosition(28 + dx * 6, -4 + dy * 6);
    this.leftShine.setPosition(-34 + dx * 6, -14 + dy * 6);
    this.rightShine.setPosition(22 + dx * 6, -14 + dy * 6);
  }

  blink(time) {
    if (this.mood === "sleep" || this.mood === "dead") return;
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
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.12,
      scaleY: 0.88,
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
}
