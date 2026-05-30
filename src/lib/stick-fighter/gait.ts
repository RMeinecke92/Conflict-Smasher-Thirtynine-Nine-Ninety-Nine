/**
 * Step-and-slide footwork for the stick fighters.
 *
 * This is animation, NOT simulation. The combat physics in `simulation.ts`
 * treats each fighter as a single point. This module decides where the two
 * feet plant on the ground so the body can slide between them like a fencer
 * advancing and retreating — feet stay planted, then one foot picks up and
 * re-establishes the stance. The lead foot never crosses behind the rear foot.
 *
 * The state lives in the render layer (not in `GameState`) so the simulation
 * stays pure and deterministic. Everything here is a pure function of its
 * inputs + the passed-in state, which is what lets the gait be unit-tested
 * without touching a canvas.
 */

/** Distance from body center to each foot's resting spot (half the stance). */
export const HALF_STANCE = 22;
/** How far a foot may drift from its resting spot before it must step. */
export const STEP_TRIGGER = 18;
/** How far past the resting spot a foot plants when it steps (deliberate). */
export const STEP_OVERSHOOT = 8;
/** Swing progress added per tick (1 / SWING_SPEED ≈ ticks per step). */
export const SWING_SPEED = 0.4;
/** Peak height a foot lifts off the ground mid-step. */
export const LIFT_HEIGHT = 11;
/** Lead foot must always stay at least this far in front of the rear foot. */
export const MIN_FOOT_GAP = 14;
/** When idle, a foot only re-centers if it has strayed at least this far. */
export const IDLE_SETTLE_TRIGGER = 26;

export type FootSide = "lead" | "rear";

export type GaitState = {
  /** World x of the lead (facing-forward) foot's planted spot. */
  leadX: number;
  /** World x of the rear (facing-back) foot's planted spot. */
  rearX: number;
  /** Facing the anchors were last resolved against. */
  facing: 1 | -1;
  /** Which foot is mid-step, or null when both are planted. */
  swing: FootSide | null;
  /** Swing progress, 0..1. */
  swingT: number;
  swingFromX: number;
  swingToX: number;
  /** False until anchors have been seeded under the body. */
  initialized: boolean;
};

export function createGaitState(): GaitState {
  return {
    leadX: 0,
    rearX: 0,
    facing: 1,
    swing: null,
    swingT: 0,
    swingFromX: 0,
    swingToX: 0,
    initialized: false,
  };
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function startSwing(
  state: GaitState,
  side: FootSide,
  ideal: number,
  travelDir: number,
) {
  const from = side === "lead" ? state.leadX : state.rearX;
  state.swing = side;
  state.swingT = 0;
  state.swingFromX = from;
  state.swingToX = ideal + STEP_OVERSHOOT * travelDir;
}

/** Keep the lead foot in front of the rear foot in facing space. */
function clampOrder(state: GaitState, facing: 1 | -1) {
  const separation = (state.leadX - state.rearX) * facing;
  if (separation < MIN_FOOT_GAP) {
    state.leadX = state.rearX + MIN_FOOT_GAP * facing;
  }
}

/**
 * Advance the foot anchors by one tick.
 *
 * @param bodyX   current body center in world space
 * @param vx      horizontal velocity this tick
 * @param facing  1 = facing right, -1 = facing left
 * @param walking true only when the fighter is grounded and actually moving
 */
export function advanceGait(
  state: GaitState,
  bodyX: number,
  vx: number,
  facing: 1 | -1,
  walking: boolean,
): GaitState {
  const leadIdeal = bodyX + HALF_STANCE * facing;
  const rearIdeal = bodyX - HALF_STANCE * facing;

  if (!state.initialized) {
    state.leadX = leadIdeal;
    state.rearX = rearIdeal;
    state.facing = facing;
    state.swing = null;
    state.swingT = 0;
    state.initialized = true;
    return state;
  }

  // Facing flips when fighters cross over. Keep the physically-forward foot as
  // the lead foot and abandon any in-progress step.
  if (facing !== state.facing) {
    const tmp = state.leadX;
    state.leadX = state.rearX;
    state.rearX = tmp;
    state.swing = null;
    state.swingT = 0;
    state.facing = facing;
  }

  // Finish an in-progress step before considering a new one (one foot moves at
  // a time — that single-foot motion is what reads as a shuffle).
  if (state.swing) {
    state.swingT = Math.min(1, state.swingT + SWING_SPEED);
    const eased = easeInOut(state.swingT);
    const x = state.swingFromX + (state.swingToX - state.swingFromX) * eased;
    if (state.swing === "lead") state.leadX = x;
    else state.rearX = x;
    if (state.swingT >= 1) {
      if (state.swing === "lead") state.leadX = state.swingToX;
      else state.rearX = state.swingToX;
      state.swing = null;
      state.swingT = 0;
    }
    clampOrder(state, facing);
    return state;
  }

  const leadGap = leadIdeal - state.leadX;
  const rearGap = rearIdeal - state.rearX;
  const travelDir = vx === 0 ? 0 : vx > 0 ? 1 : -1;

  if (walking && travelDir !== 0) {
    const leadStretch = Math.abs(leadGap);
    const rearStretch = Math.abs(rearGap);
    if (leadStretch >= STEP_TRIGGER || rearStretch >= STEP_TRIGGER) {
      const side: FootSide = leadStretch >= rearStretch ? "lead" : "rear";
      startSwing(state, side, side === "lead" ? leadIdeal : rearIdeal, travelDir);
    }
  } else {
    // Idle: only step a foot back under the body if it has drifted far, so a
    // standing fighter keeps its feet planted instead of sliding them.
    if (Math.abs(leadGap) >= IDLE_SETTLE_TRIGGER) {
      startSwing(state, "lead", leadIdeal, 0);
    } else if (Math.abs(rearGap) >= IDLE_SETTLE_TRIGGER) {
      startSwing(state, "rear", rearIdeal, 0);
    }
  }

  clampOrder(state, facing);
  return state;
}

/** Height the given foot is lifted off the ground this tick (0 when planted). */
export function footLift(state: GaitState, side: FootSide): number {
  if (state.swing !== side) return 0;
  return Math.sin(Math.min(1, state.swingT) * Math.PI) * LIFT_HEIGHT;
}
