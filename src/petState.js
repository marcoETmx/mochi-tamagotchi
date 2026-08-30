import { DEFAULT_SPECIES, normalizeSpecies, sanitizeName } from "./species.js";

const MAX = 100;

export const STATS = [
  { key: "comida", label: "Comida", color: 0xff8fab, icon: "🍪" },
  { key: "felicidad", label: "Ánimo", color: 0xffc85c, icon: "💛" },
  { key: "limpieza", label: "Limpio", color: 0x7fd8d4, icon: "✨" },
  { key: "energia", label: "Energía", color: 0xb39ddb, icon: "⚡" },
  { key: "salud", label: "Salud", color: 0x81c784, icon: "💚" },
];

const DECAY_PER_HOUR = {
  comida: 11,
  felicidad: 7,
  limpieza: 5.5,
  energia: 4.5,
};

export function clamp(value, min = 0, max = MAX) {
  return Math.max(min, Math.min(max, value));
}

export function createDefaultState(name = "Mochi", species = DEFAULT_SPECIES) {
  const now = Date.now();
  const trimmed = sanitizeName(name);
  return {
    name: trimmed || "Mochi",
    species: normalizeSpecies(species),
    bornAt: now,
    lastTick: now,
    sleeping: false,
    dead: false,
    stats: {
      comida: 82,
      felicidad: 78,
      limpieza: 90,
      energia: 72,
      salud: 100,
    },
  };
}

export function ageInDays(state, now = Date.now()) {
  return Math.max(0, Math.floor((now - state.bornAt) / 86_400_000));
}

export function applyElapsed(state, now = Date.now()) {
  if (state.dead) {
    state.lastTick = now;
    return state;
  }

  const hours = Math.max(0, (now - state.lastTick) / 3_600_000);
  if (hours <= 0) return state;

  const stats = state.stats;

  stats.comida = clamp(stats.comida - DECAY_PER_HOUR.comida * hours);
  stats.felicidad = clamp(
    stats.felicidad - DECAY_PER_HOUR.felicidad * hours * (state.sleeping ? 0.45 : 1),
  );
  stats.limpieza = clamp(stats.limpieza - DECAY_PER_HOUR.limpieza * hours);

  if (state.sleeping) {
    stats.energia = clamp(stats.energia + 22 * hours);
  } else {
    stats.energia = clamp(stats.energia - DECAY_PER_HOUR.energia * hours);
  }

  let healthLoss = 0;
  if (stats.comida < 18) healthLoss += (18 - stats.comida) * 0.55 * hours;
  if (stats.limpieza < 18) healthLoss += (18 - stats.limpieza) * 0.35 * hours;
  if (stats.felicidad < 12) healthLoss += (12 - stats.felicidad) * 0.28 * hours;
  if (stats.energia < 8 && !state.sleeping) healthLoss += 2.5 * hours;
  stats.salud = clamp(stats.salud - healthLoss);

  if (state.sleeping && (stats.comida < 10 || stats.salud < 28)) {
    state.sleeping = false;
  }

  if (stats.salud <= 0) {
    stats.salud = 0;
    state.dead = true;
    state.sleeping = false;
  }

  state.lastTick = now;
  return state;
}

export function applyDelta(state, deltas) {
  if (state.dead) return { ok: false, reason: "dead" };

  for (const [key, amount] of Object.entries(deltas)) {
    if (key in state.stats) {
      state.stats[key] = clamp(state.stats[key] + amount);
    }
  }
  return { ok: true };
}

export function getMood(state) {
  if (state.dead) return "dead";
  if (state.sleeping) return "sleep";

  const { comida, felicidad, limpieza, energia, salud } = state.stats;
  if (salud < 32) return "sick";
  if (comida < 24) return "hungry";
  if (limpieza < 26) return "dirty";
  if (energia < 18) return "tired";
  if (felicidad < 28) return "sad";
  if (felicidad > 72 && comida > 45 && salud > 60) return "happy";
  return "ok";
}

export function canFeed(state) {
  if (state.dead) return { ok: false, message: "..." };
  if (state.sleeping) return { ok: false, message: "Está dormidito... 💤" };
  if (state.stats.comida > 92) return { ok: false, message: "¡Estoy llenito! 🥺" };
  return { ok: true };
}

export function canPlay(state) {
  if (state.dead) return { ok: false, message: "..." };
  if (state.sleeping) return { ok: false, message: "Está dormidito... 💤" };
  if (state.stats.energia < 16) return { ok: false, message: "Estoy cansadito... 💤" };
  return { ok: true };
}

export function canBathe(state) {
  if (state.dead) return { ok: false, message: "..." };
  if (state.sleeping) return { ok: false, message: "Está dormidito... 💤" };
  if (state.stats.limpieza > 94) return { ok: false, message: "¡Ya brillo de limpio! ✨" };
  return { ok: true };
}

export function canHeal(state) {
  if (state.dead) return { ok: false, message: "..." };
  if (state.sleeping) return { ok: false, message: "Está dormidito... 💤" };
  if (state.stats.salud > 92) return { ok: false, message: "¡Estoy sanísimo! 💚" };
  return { ok: true };
}

export function feed(state) {
  const check = canFeed(state);
  if (!check.ok) return check;
  applyDelta(state, { comida: 34, felicidad: 7, energia: 3 });
  return { ok: true, message: "¡Ñam ñam! 🍪" };
}

export function play(state) {
  const check = canPlay(state);
  if (!check.ok) return check;
  applyDelta(state, {
    felicidad: 30,
    energia: -16,
    limpieza: -9,
    comida: -4,
  });
  return { ok: true, message: "¡Qué divertido! 🎾" };
}

export function bathe(state) {
  const check = canBathe(state);
  if (!check.ok) return check;
  applyDelta(state, { limpieza: 48, felicidad: 6 });
  return { ok: true, message: "¡Qué fresquito! 🛁" };
}

export function heal(state) {
  const check = canHeal(state);
  if (!check.ok) return check;
  applyDelta(state, { salud: 40, felicidad: 4 });
  return { ok: true, message: "¡Ya me siento mejor! 💊" };
}

export function toggleSleep(state) {
  if (state.dead) return { ok: false, message: "..." };
  state.sleeping = !state.sleeping;
  if (state.sleeping) {
    return { ok: true, message: "Buenas noches... 🌙", sleeping: true };
  }
  return { ok: true, message: "¡Buenos días! ☀️", sleeping: false };
}

export function boop(state) {
  if (state.dead || state.sleeping) return { ok: false };
  applyDelta(state, { felicidad: 2 });
  return { ok: true, message: "¡Boop! 💕" };
}
