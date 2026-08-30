import Phaser from "phaser";
import { view } from "./viewport.js";

export function makeButton(scene, x, y, w, h, fill, emoji, label, onClick) {
  const { font, px } = view(scene);
  const container = scene.add.container(x, y);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x5a3d4a, 0.12);
  shadow.fillRoundedRect(-w / 2 + 2, -h / 2 + 4, w, h, 20);

  const bg = scene.add.graphics();
  bg.fillStyle(fill, 1);
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);

  const emojiText = scene.add
    .text(0, -h * 0.14, emoji, { fontSize: font(28) })
    .setOrigin(0.5);
  const labelText = scene.add
    .text(0, h * 0.24, label, {
      fontFamily: "Fredoka, sans-serif",
      fontSize: font(13),
      color: "#5a3d4a",
      fontStyle: "600",
    })
    .setOrigin(0.5);

  container.add([shadow, bg, emojiText, labelText]);
  container.emojiText = emojiText;
  container.labelText = labelText;
  container.setSize(w, h);

  const hitW = w + px(16);
  const hitH = h + px(16);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH),
    Phaser.Geom.Rectangle.Contains,
  );

  const press = () => {
    scene.tweens.add({ targets: container, scale: 0.92, duration: 70 });
  };
  const release = (fire) => {
    scene.tweens.add({ targets: container, scale: 1, duration: 90, ease: "Back.out" });
    if (fire) onClick();
  };

  container.on("pointerdown", press);
  container.on("pointerup", () => release(true));
  container.on("pointerupoutside", () => release(false));
  container.on("pointerout", () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 90 });
  });

  return container;
}

export function makePill(scene, x, y, w, h, fill, text, onClick) {
  const { font, px } = view(scene);
  const container = scene.add.container(x, y);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x5a3d4a, 0.14);
  shadow.fillRoundedRect(-w / 2 + 1, -h / 2 + 4, w, h, h / 2);

  const bg = scene.add.graphics();
  bg.fillStyle(fill, 1);
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);

  const label = scene.add
    .text(0, 0, text, {
      fontFamily: "Fredoka, sans-serif",
      fontSize: font(22),
      color: "#5a3d4a",
      fontStyle: "700",
    })
    .setOrigin(0.5);

  container.add([shadow, bg, label]);
  container.setSize(w, h);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-w / 2 - px(8), -h / 2 - px(8), w + px(16), h + px(16)),
    Phaser.Geom.Rectangle.Contains,
  );
  let armed = false;
  container.on("pointerdown", () => {
    armed = true;
    scene.tweens.add({ targets: container, scale: 0.96, duration: 70 });
  });
  container.on("pointerup", () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 90, ease: "Back.out" });
    if (!armed) return;
    armed = false;
    onClick();
  });
  container.on("pointerupoutside", () => {
    armed = false;
    scene.tweens.add({ targets: container, scale: 1, duration: 90 });
  });
  container.on("pointerout", () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 90 });
  });
  container.label = label;
  return container;
}

export function toast(scene, message) {
  const existing = scene.children.getByName("toast");
  if (existing) existing.destroy();
  const { w, safe, font } = view(scene);
  const y = safe.top + 158;

  const t = scene.add
    .text(w / 2, y + 10, message, {
      fontFamily: "Fredoka, sans-serif",
      fontSize: font(18),
      color: "#5a3d4a",
      backgroundColor: "#fff7fb",
      padding: { x: 16, y: 8 },
      fontStyle: "600",
    })
    .setOrigin(0.5)
    .setDepth(40)
    .setName("toast")
    .setAlpha(0);

  scene.tweens.add({
    targets: t,
    alpha: 1,
    y,
    duration: 180,
    yoyo: true,
    hold: 1100,
    onComplete: () => t.destroy(),
  });
}
