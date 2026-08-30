import Phaser from "phaser";

export const W = 390;
export const H = 844;

export function roundedPanel(scene, x, y, w, h, fill, radius = 22, alpha = 0.92) {
  const g = scene.add.graphics();
  g.fillStyle(fill, alpha);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, radius);
  return g;
}

export function makeButton(scene, x, y, w, h, fill, emoji, label, onClick) {
  const container = scene.add.container(x, y);
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x5a3d4a, 0.12);
  shadow.fillRoundedRect(-w / 2 + 2, -h / 2 + 4, w, h, 20);

  const bg = scene.add.graphics();
  bg.fillStyle(fill, 1);
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);

  const emojiText = scene.add
    .text(0, -11, emoji, { fontSize: "26px" })
    .setOrigin(0.5);
  const labelText = scene.add
    .text(0, 18, label, {
      fontFamily: "Fredoka, sans-serif",
      fontSize: "13px",
      color: "#5a3d4a",
      fontStyle: "600",
    })
    .setOrigin(0.5);

  container.add([shadow, bg, emojiText, labelText]);
  container.emojiText = emojiText;
  container.labelText = labelText;
  container.setSize(w, h);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
    Phaser.Geom.Rectangle.Contains,
  );

  container.on("pointerdown", () => {
    scene.tweens.add({ targets: container, scale: 0.92, duration: 70 });
  });
  container.on("pointerup", () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 90, ease: "Back.out" });
    onClick();
  });
  container.on("pointerout", () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 90 });
  });

  container.setEnabled = (enabled) => {
    container.setAlpha(enabled ? 1 : 0.45);
  };

  return container;
}

export function makePill(scene, x, y, w, h, fill, text, onClick) {
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
      fontSize: "22px",
      color: "#5a3d4a",
      fontStyle: "700",
    })
    .setOrigin(0.5);

  container.add([shadow, bg, label]);
  container.setSize(w, h);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
    Phaser.Geom.Rectangle.Contains,
  );
  container.on("pointerdown", () => {
    scene.tweens.add({ targets: container, scale: 0.96, duration: 70 });
  });
  container.on("pointerup", () => {
    scene.tweens.add({ targets: container, scale: 1, duration: 90, ease: "Back.out" });
    onClick();
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

  const t = scene.add
    .text(W / 2, 168, message, {
      fontFamily: "Fredoka, sans-serif",
      fontSize: "18px",
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
    y: 158,
    duration: 180,
    yoyo: true,
    hold: 1100,
    onComplete: () => t.destroy(),
  });
}
