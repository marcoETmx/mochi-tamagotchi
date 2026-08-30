function canvasTexture(scene, key, width, height, draw) {
  const texture = scene.textures.createCanvas(key, width, height);
  const ctx = texture.getContext();
  draw(ctx, width, height);
  texture.refresh();
  return texture;
}

function drawBlobBody(ctx, s, [light, mid, dark]) {
  const g = ctx.createRadialGradient(s * 0.38, s * 0.34, 16, s * 0.5, s * 0.52, s * 0.46);
  g.addColorStop(0, light);
  g.addColorStop(0.42, mid);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(s / 2, s / 2 + 8, 108, 100, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTlacuacheBody(ctx, s, [light, mid, dark]) {
  const cx = s / 2;
  const cy = s / 2 + 10;
  const g = ctx.createRadialGradient(cx - 28, cy - 36, 16, cx, cy, s * 0.46);
  g.addColorStop(0, light);
  g.addColorStop(0.42, mid);
  g.addColorStop(1, dark);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 100, 98, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = light;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 18, 52, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawBorregoBody(ctx, s, colors) {
  const cx = s / 2;
  const cy = s / 2 + 8;
  const puffs = [
    [cx, cy - 18, 54],
    [cx - 50, cy - 2, 46],
    [cx + 50, cy - 2, 46],
    [cx - 38, cy + 38, 44],
    [cx + 38, cy + 38, 44],
    [cx, cy + 30, 52],
    [cx - 24, cy - 50, 36],
    [cx + 24, cy - 50, 36],
    [cx, cy - 58, 32],
  ];
  for (const [x, y, r] of puffs) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 4, x, y, r);
    g.addColorStop(0, colors.light);
    g.addColorStop(0.55, colors.mid);
    g.addColorStop(1, colors.dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const face = ctx.createRadialGradient(cx - 10, cy - 8, 8, cx, cy + 4, 50);
  face.addColorStop(0, colors.faceLight);
  face.addColorStop(1, colors.faceDark);
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 48, 52, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function createTextures(scene) {
  canvasTexture(scene, "sky", 390, 844, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#ffd3ea");
    g.addColorStop(0.38, "#ffe7f4");
    g.addColorStop(0.62, "#e9f4ff");
    g.addColorStop(1, "#d7ecff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  canvasTexture(scene, "pet-body", 256, 256, (ctx, s) => {
    drawBlobBody(ctx, s, ["#fff3f8", "#ffb7d5", "#f48fb1"]);
  });

  canvasTexture(scene, "pet-body-sick", 256, 256, (ctx, s) => {
    drawBlobBody(ctx, s, ["#f3ffe8", "#c5e1a5", "#9ccc65"]);
  });

  canvasTexture(scene, "pet-tlacuache", 256, 256, (ctx, s) => {
    drawTlacuacheBody(ctx, s, ["#f7f3ee", "#cfc4b8", "#a89888"]);
  });

  canvasTexture(scene, "pet-tlacuache-sick", 256, 256, (ctx, s) => {
    drawTlacuacheBody(ctx, s, ["#f3ffe8", "#c5d4b0", "#9aaa78"]);
  });

  canvasTexture(scene, "pet-borrego", 256, 256, (ctx, s) => {
    drawBorregoBody(ctx, s, {
      light: "#ffffff",
      mid: "#f2ebe3",
      dark: "#e0d4c8",
      faceLight: "#ffe8c8",
      faceDark: "#f5d0b0",
    });
  });

  canvasTexture(scene, "pet-borrego-sick", 256, 256, (ctx, s) => {
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
}
