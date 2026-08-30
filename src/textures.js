function canvasTexture(scene, key, width, height, draw) {
  const texture = scene.textures.createCanvas(key, width, height);
  const ctx = texture.getContext();
  draw(ctx, width, height);
  texture.refresh();
  return texture;
}

function fillRoundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fill();
}

function drawBlobBody(ctx, s, [light, mid, dark]) {
  const k = s / 256;
  const g = ctx.createRadialGradient(s * 0.38, s * 0.34, 16 * k, s * 0.5, s * 0.52, s * 0.46);
  g.addColorStop(0, light);
  g.addColorStop(0.42, mid);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(s / 2, s / 2 + 8 * k, 108 * k, 100 * k, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTlacuacheBody(ctx, s, [light, mid, dark]) {
  const k = s / 256;
  const cx = s / 2;
  const cy = s / 2 + 10 * k;
  const g = ctx.createRadialGradient(cx - 28 * k, cy - 36 * k, 16 * k, cx, cy, s * 0.46);
  g.addColorStop(0, light);
  g.addColorStop(0.42, mid);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 100 * k, 98 * k, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = light;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 18 * k, 52 * k, 38 * k, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawBorregoBody(ctx, s, colors) {
  const k = s / 256;
  const cx = s / 2;
  const cy = s / 2 + 8 * k;
  const puffs = [
    [cx, cy - 18 * k, 54 * k],
    [cx - 50 * k, cy - 2 * k, 46 * k],
    [cx + 50 * k, cy - 2 * k, 46 * k],
    [cx - 38 * k, cy + 38 * k, 44 * k],
    [cx + 38 * k, cy + 38 * k, 44 * k],
    [cx, cy + 30 * k, 52 * k],
    [cx - 24 * k, cy - 50 * k, 36 * k],
    [cx + 24 * k, cy - 50 * k, 36 * k],
    [cx, cy - 58 * k, 32 * k],
  ];
  for (const [x, y, r] of puffs) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 4 * k, x, y, r);
    g.addColorStop(0, colors.light);
    g.addColorStop(0.55, colors.mid);
    g.addColorStop(1, colors.dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const face = ctx.createRadialGradient(cx - 10 * k, cy - 8 * k, 8 * k, cx, cy + 4 * k, 50 * k);
  face.addColorStop(0, colors.faceLight);
  face.addColorStop(1, colors.faceDark);
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4 * k, 48 * k, 52 * k, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function createTextures(scene) {
  canvasTexture(scene, "sky", 1200, 2400, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#ffd3ea");
    g.addColorStop(0.38, "#ffe7f4");
    g.addColorStop(0.62, "#e9f4ff");
    g.addColorStop(1, "#d7ecff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  canvasTexture(scene, "pet-body", 512, 512, (ctx, s) => {
    drawBlobBody(ctx, s, ["#fff3f8", "#ffb7d5", "#f48fb1"]);
  });

  canvasTexture(scene, "pet-body-sick", 512, 512, (ctx, s) => {
    drawBlobBody(ctx, s, ["#f3ffe8", "#c5e1a5", "#9ccc65"]);
  });

  canvasTexture(scene, "pet-tlacuache", 512, 512, (ctx, s) => {
    drawTlacuacheBody(ctx, s, ["#f7f3ee", "#cfc4b8", "#a89888"]);
  });

  canvasTexture(scene, "pet-tlacuache-sick", 512, 512, (ctx, s) => {
    drawTlacuacheBody(ctx, s, ["#f3ffe8", "#c5d4b0", "#9aaa78"]);
  });

  canvasTexture(scene, "pet-borrego", 512, 512, (ctx, s) => {
    drawBorregoBody(ctx, s, {
      light: "#ffffff",
      mid: "#f2ebe3",
      dark: "#e0d4c8",
      faceLight: "#ffe8c8",
      faceDark: "#f5d0b0",
    });
  });

  canvasTexture(scene, "pet-borrego-sick", 512, 512, (ctx, s) => {
    drawBorregoBody(ctx, s, {
      light: "#f3ffe8",
      mid: "#c5e1a5",
      dark: "#9ccc65",
      faceLight: "#e8f5d0",
      faceDark: "#c5d48a",
    });
  });

  canvasTexture(scene, "dot", 16, 16, (ctx) => {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  canvasTexture(scene, "heart", 32, 32, (ctx) => {
    ctx.fillStyle = "#ff6b9d";
    ctx.beginPath();
    ctx.moveTo(16, 28);
    ctx.bezierCurveTo(4, 18, 2, 10, 9, 7);
    ctx.bezierCurveTo(13, 5, 16, 8, 16, 12);
    ctx.bezierCurveTo(16, 8, 19, 5, 23, 7);
    ctx.bezierCurveTo(30, 10, 28, 18, 16, 28);
    ctx.fill();
  });

  canvasTexture(scene, "star", 24, 24, (ctx) => {
    const cx = 12;
    const cy = 12;
    const spikes = 5;
    const outer = 11;
    const inner = 5;
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (Math.PI / spikes) * i - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  });

  canvasTexture(scene, "bubble", 20, 20, (ctx) => {
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(10, 10, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.beginPath();
    ctx.arc(10, 10, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(7, 7, 1.6, 0, Math.PI * 2);
    ctx.fill();
  });

  canvasTexture(scene, "cookie", 64, 64, (ctx) => {
    const g = ctx.createRadialGradient(24, 22, 6, 32, 34, 28);
    g.addColorStop(0, "#f3d5a6");
    g.addColorStop(0.7, "#d9a066");
    g.addColorStop(1, "#b87a3c");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(32, 32, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b3e26";
    for (const [x, y, r] of [
      [22, 24, 3.2],
      [38, 20, 2.6],
      [40, 36, 3],
      [26, 40, 2.4],
      [32, 28, 2.2],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  canvasTexture(scene, "crumb", 12, 12, (ctx) => {
    ctx.fillStyle = "#c48a4a";
    ctx.beginPath();
    ctx.arc(6, 6, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  canvasTexture(scene, "ball", 48, 48, (ctx) => {
    const g = ctx.createRadialGradient(16, 14, 4, 24, 26, 22);
    g.addColorStop(0, "#e8ff7a");
    g.addColorStop(1, "#9ccc12");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(24, 24, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f7fff0";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(8, 24, 16, -0.7, 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(40, 24, 16, Math.PI - 0.7, Math.PI + 0.7);
    ctx.stroke();
  });

  canvasTexture(scene, "pill", 48, 28, (ctx) => {
    ctx.fillStyle = "#ff8fab";
    fillRoundRect(ctx, 2, 4, 22, 20, 10);
    ctx.fillStyle = "#fff7fb";
    fillRoundRect(ctx, 24, 4, 22, 20, 10);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(22, 6, 4, 16);
  });

  canvasTexture(scene, "soap", 48, 32, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 32);
    g.addColorStop(0, "#ffe3f0");
    g.addColorStop(1, "#ff9ec0");
    ctx.fillStyle = g;
    fillRoundRect(ctx, 4, 6, 40, 20, 10);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(16, 12, 8, 3, -0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  canvasTexture(scene, "duck", 56, 52, (ctx) => {
    ctx.fillStyle = "#ffe066";
    ctx.beginPath();
    ctx.ellipse(28, 32, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(36, 16, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff9f43";
    ctx.beginPath();
    ctx.moveTo(44, 16);
    ctx.lineTo(54, 18);
    ctx.lineTo(44, 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3d2c3a";
    ctx.beginPath();
    ctx.arc(38, 14, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff8fab";
    ctx.beginPath();
    ctx.ellipse(22, 34, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  canvasTexture(scene, "plus", 24, 24, (ctx) => {
    ctx.fillStyle = "#66bb6a";
    ctx.fillRect(9, 3, 6, 18);
    ctx.fillRect(3, 9, 18, 6);
  });
}
