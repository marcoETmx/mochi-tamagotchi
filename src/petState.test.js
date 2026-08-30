import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyElapsed,
  createDefaultState,
  feed,
  getMood,
  play,
} from "./petState.js";
import { normalizeSpecies, sanitizeName } from "./species.js";

describe("petState", () => {
  it("starts happy and alive", () => {
    const state = createDefaultState();
    assert.equal(state.dead, false);
    assert.equal(getMood(state), "happy");
    assert.equal(state.species, "tlacuache");
  });

  it("stores custom name and species", () => {
    const state = createDefaultState("Luna", "borrego");
    assert.equal(state.name, "Luna");
    assert.equal(state.species, "borrego");
  });

  it("defaults unknown species to tlacuache", () => {
    assert.equal(normalizeSpecies("gato"), "tlacuache");
    assert.equal(createDefaultState("Luna", "gato").species, "tlacuache");
  });

  it("trims and caps names", () => {
    assert.equal(sanitizeName("  Pepe  "), "Pepe");
    assert.equal(sanitizeName("abcdefghijklmnop").length, 12);
  });

  it("feeding raises comida", () => {
    const state = createDefaultState();
    state.stats.comida = 40;
    const result = feed(state);
    assert.equal(result.ok, true);
    assert.ok(state.stats.comida > 40);
  });

  it("dies after long neglect", () => {
    const state = createDefaultState();
    state.lastTick = Date.now() - 48 * 3600 * 1000;
    applyElapsed(state);
    assert.equal(state.dead, true);
    assert.equal(state.stats.salud, 0);
    assert.equal(getMood(state), "dead");
  });

  it("refuses play when exhausted", () => {
    const state = createDefaultState();
    state.stats.energia = 5;
    const result = play(state);
    assert.equal(result.ok, false);
  });
});
