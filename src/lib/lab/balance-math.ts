import { TICK_MS } from "@/lib/lab/constants";

/** Must match Engine.create gravity in world.ts */
export const GRAVITY = {
  x: 0,
  y: 1,
  scale: 0.001,
} as const;

/**
 * Matter.js adds force each step: Fy = mass * gravity.y * gravity.scale
 * Dividing by mass gives the per-step downward acceleration contribution.
 */
export function gravityAccelPerStep(): number {
  return GRAVITY.y * GRAVITY.scale;
}

/**
 * If you call Body.applyForce(body, pos, { x: 0, y: -k * mass }) every step,
 * the body feels an UPWARD accel of k per unit mass.
 *
 * Rocket condition: k > gravityAccelPerStep()  → net upward accel every frame
 * Hover condition:  k === gravityAccelPerStep() → cancels gravity (fragile)
 * Safe rule:       never apply net upward force while standing; use angular
 *                  correction + leg straightening instead.
 */
export function maxSafeUpwardForcePerMass(): number {
  return gravityAccelPerStep();
}

/** Rough ticks per second from our fixed step (for gain scaling). */
export function stepsPerSecond(): number {
  return 1000 / TICK_MS;
}

export type BalanceBudget = {
  gravityPerStep: number;
  maxSafeUpwardPerMass: number;
  rocketThresholdPerMass: number;
};

export function getBalanceBudget(): BalanceBudget {
  const gravityPerStep = gravityAccelPerStep();
  return {
    gravityPerStep,
    maxSafeUpwardPerMass: gravityPerStep,
    rocketThresholdPerMass: gravityPerStep * 1.001,
  };
}

/**
 * PD angular correction applied via setAngularVelocity each step.
 * At 60 Hz, KP * tiltRadians ≈ rad/s added per step before damping.
 *
 * Rule of thumb for torso:
 *   KP * 0.5 rad (~30° tilt) should produce ~0.1–0.25 rad/s correction
 *   so KP ≈ 0.2–0.5 at 60 Hz
 *
 * Legs need lower KP — they must yield slightly or the ragdoll looks stiff.
 */
export function suggestedTorsoKp(): number {
  return 0.35;
}

export function suggestedLegKp(): number {
  return suggestedTorsoKp() * 0.55;
}

/** Average knee bend: how far lower-leg angle deviates from upper-leg angle (degrees). */
export function measureKneeBendDeg(
  upperAngle: number,
  lowerAngle: number,
): number {
  let delta = lowerAngle - upperAngle;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return Math.abs((delta * 180) / Math.PI);
}

export function measureTiltFromVerticalDeg(bodyAngle: number): number {
  return Math.abs((bodyAngle * 180) / Math.PI);
}
