import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { containerHitBox, pointHitsContainer } from "./hitArea.js";

describe("container hit areas", () => {
  const w = 80;
  const h = 90;
  const box = containerHitBox(w, h);

  it("registers a tap on the visual center", () => {
    assert.equal(pointHitsContainer(box, w, h, 0, 0), true);
  });

  it("registers taps on the left and right edges of the same button", () => {
    assert.equal(pointHitsContainer(box, w, h, -w / 2, 0), true);
    assert.equal(pointHitsContainer(box, w, h, w / 2, 0), true);
  });

  it("does not steal a tap on the neighboring button to the right", () => {
    const gap = 10;
    const neighborCenter = w + gap;
    assert.equal(pointHitsContainer(box, w, h, neighborCenter, 0), false);
  });

  it("does not steal a tap on the neighboring button to the left", () => {
    const gap = 10;
    const neighborCenter = -(w + gap);
    assert.equal(pointHitsContainer(box, w, h, neighborCenter, 0), false);
  });

  it("the old centered rectangle misses the right half and hits the neighbor", () => {
    const broken = { x: -w / 2, y: -h / 2, width: w, height: h };
    assert.equal(pointHitsContainer(broken, w, h, w / 2, 0), false);

    const neighborRightHalf = -(w / 2 + 8);
    assert.equal(pointHitsContainer(broken, w, h, neighborRightHalf, 0), true);
    assert.equal(pointHitsContainer(box, w, h, neighborRightHalf, 0), false);
  });
});
