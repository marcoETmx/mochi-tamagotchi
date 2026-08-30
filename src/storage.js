import { normalizeSpecies } from "./species.js";

const KEY = "mochi-tamagotchi-v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.stats) return null;
    data.species = normalizeSpecies(data.species);
    return data;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota — the game still works for the session.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
