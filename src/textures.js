function canvasTexture(scene, key, width, height, draw) {
  const texture = scene.textures.createCanvas(key, width, height);
  const ctx = texture.getContext();
  draw(ctx, width, height);
  texture.refresh();
  return texture;
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
    const g = ctx.createRadialGradient(s * 0.38, s * 0.34, 32, s * 0.5, s * 0.52, s * 0.46);
    g.addColorStop(0, "#fff3f8");
    g.addColorStop(0.42, "#ffb7d5");
    g.addColorStop(1, "#f48fb1");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(s / 2, s / 2 + 16, 216, 200, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  canvasTexture(scene, "pet-body-sick", 512, 512, (ctx, s) => {
    const g = ctx.createRadialGradient(s * 0.38, s * 0.34, 32, s * 0.5, s * 0.52, s * 0.46);
    g.addColorStop(0, "#f3ffe8");
    g.addColorStop(0.45, "#c5e1a5");
    g.addColorStop(1, "#9ccc65");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(s / 2, s / 2 + 16, 216, 200, 0, 0, Math.PI * 2);
    ctx.fill();
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
