import { describe, expect, it } from "vitest";

import {
  HALF_STANCE,
  MIN_FOOT_GAP,
  advanceGait,
  createGaitState,
  type GaitState,
} from "./gait";

const MOVE_SPEED = 4.4;

/** Lead foot's signed distance in front of the rear foot, in facing space. */
function separation(state: GaitState, facing: 1 | -1): number {
  return (state.leadX - state.rearX) * facing;
}

describe("advanceGait — stance + initialization", () => {
  it("seeds the feet symmetrically around the body", () => {
    const s = createGaitState();
    advanceGait(s, 100, 0, 1, false);
    expect(s.leadX).toBeCloseTo(100 + HALF_STANCE, 5);
    expect(s.rearX).toBeCloseTo(100 - HALF_STANCE, 5);
  });

  it("keeps feet planted while standing still", () => {
    const s = createGaitState();
    advanceGait(s, 100, 0, 1, false);
    const lead = s.leadX;
    const rear = s.rearX;
    for (let i = 0; i < 120; i++) advanceGait(s, 100, 0, 1, false);
    expect(s.leadX).toBeCloseTo(lead, 5);
    expect(s.rearX).toBeCloseTo(rear, 5);
    expect(s.swing).toBeNull();
  });
});

describe("advanceGait — feet never cross", () => {
  it("lead stays in front of rear while walking forward", () => {
    const s = createGaitState();
    advanceGait(s, 200, 0, 1, false);
    let x = 200;
    for (let i = 0; i < 200; i++) {
      advanceGait(s, x, MOVE_SPEED, 1, true);
      x += MOVE_SPEED;
      expect(separation(s, 1)).toBeGreaterThanOrEqual(MIN_FOOT_GAP - 1e-6);
    }
  });

  it("lead stays in front of rear while walking backward", () => {
    const s = createGaitState();
    advanceGait(s, 400, 0, 1, false);
    let x = 400;
    for (let i = 0; i < 200; i++) {
      advanceGait(s, x, -MOVE_SPEED, 1, true);
      x -= MOVE_SPEED;
      expect(separation(s, 1)).toBeGreaterThanOrEqual(MIN_FOOT_GAP - 1e-6);
    }
  });

  it("holds the no-cross invariant when facing flips mid-walk", () => {
    const s = createGaitState();
    advanceGait(s, 300, 0, 1, false);
    let facing: 1 | -1 = 1;
    let x = 300;
    for (let i = 0; i < 120; i++) {
      if (i === 40 || i === 80) facing = (facing * -1) as 1 | -1;
      advanceGait(s, x, MOVE_SPEED * facing, facing, true);
      x += MOVE_SPEED * facing;
      expect(separation(s, facing)).toBeGreaterThanOrEqual(MIN_FOOT_GAP - 1e-6);
    }
  });
});

describe("advanceGait — planting", () => {
  it("a planted foot does not move while the other foot swings", () => {
    const s = createGaitState();
    advanceGait(s, 200, 0, 1, false);
    let x = 200;
    let sawSwing = false;
    for (let i = 0; i < 200; i++) {
      const before = { leadX: s.leadX, rearX: s.rearX };
      advanceGait(s, x, MOVE_SPEED, 1, true);
      x += MOVE_SPEED;
      if (s.swing === "lead") {
        sawSwing = true;
        expect(s.rearX).toBeCloseTo(before.rearX, 5);
      } else if (s.swing === "rear") {
        sawSwing = true;
        expect(s.leadX).toBeCloseTo(before.leadX, 5);
      }
    }
    expect(sawSwing).toBe(true);
  });

  it("re-centers a strayed foot back under the body when idle", () => {
    const s = createGaitState();
    advanceGait(s, 100, 0, 1, false);
    // Teleport the body far from the planted feet, then idle.
    for (let i = 0; i < 60; i++) {
      advanceGait(s, 400, 0, 1, false);
    }
    expect(Math.abs(s.leadX - (400 + HALF_STANCE))).toBeLessThan(HALF_STANCE);
    expect(Math.abs(s.rearX - (400 - HALF_STANCE))).toBeLessThan(HALF_STANCE);
  });
});

describe("advanceGait — stride scales with speed", () => {
  function countSteps(vx: number, ticks: number): number {
    const s = createGaitState();
    advanceGait(s, 0, 0, 1, false);
    let x = 0;
    let steps = 0;
    let wasSwinging = false;
    for (let i = 0; i < ticks; i++) {
      advanceGait(s, x, vx, 1, true);
      x += vx;
      const swinging = s.swing !== null;
      if (swinging && !wasSwinging) steps += 1;
      wasSwinging = swinging;
    }
    return steps;
  }

  it("takes more steps over the same time when moving faster", () => {
    const slow = countSteps(2.2, 240);
    const fast = countSteps(4.4, 240);
    expect(fast).toBeGreaterThan(slow);
  });

  it("does not step at all when not moving", () => {
    expect(countSteps(0, 240)).toBe(0);
  });
});
