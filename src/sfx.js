let ctx;
let muted = false;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freq, duration = 0.14, type = "sine", volume = 0.07) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0008, ac.currentTime + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export function sfxTap() {
  tone(640, 0.08, "triangle", 0.04);
}

export function sfxFeed() {
  tone(420, 0.1, "sine");
  setTimeout(() => tone(560, 0.12, "sine"), 90);
}

export function sfxPlay() {
  tone(520, 0.09, "triangle");
  setTimeout(() => tone(660, 0.09, "triangle"), 80);
  setTimeout(() => tone(780, 0.14, "triangle"), 160);
}

export function sfxBath() {
  tone(880, 0.08, "sine", 0.045);
  setTimeout(() => tone(990, 0.1, "sine", 0.04), 100);
}

export function sfxHeal() {
  tone(392, 0.16, "sine");
  setTimeout(() => tone(523, 0.18, "sine"), 120);
}

export function sfxSleep() {
  tone(330, 0.22, "sine", 0.05);
  setTimeout(() => tone(262, 0.28, "sine", 0.04), 160);
}

export function sfxBoop() {
  tone(760, 0.09, "triangle", 0.05);
}

export function sfxSad() {
  tone(280, 0.18, "sine", 0.05);
}

export function sfxDeny() {
  tone(180, 0.12, "square", 0.03);
}
