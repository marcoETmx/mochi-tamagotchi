import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyElapsed,
  createDefaultState,
  feed,
  getMood,
  play,
} from "./petState.js";

describe("petState", () => {
  it("starts happy and alive", () => {
    const state = createDefaultState();
    assert.equal(state.dead, false);
    assert.equal(getMood(state), "happy");
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
