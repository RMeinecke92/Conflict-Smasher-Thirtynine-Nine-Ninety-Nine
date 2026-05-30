import Matter from "matter-js";

import { FLOOR_Y, SEGMENT } from "@/lib/lab/constants";
import { TUNING } from "@/lib/lab/tuning";
import type { GaitState, Ragdoll } from "@/lib/lab/types";

const { Body } = Matter;

const FOOT_Y = FLOOR_Y - SEGMENT.FOOT_H * 0.5 - 1;

/**
 * Procedural walk cycle for the planted-feet ragdoll.
 *
 * The model keeps at least one foot planted (static) at all times so the body
 * is always supported. The other foot is the "swing" foot: it lifts in an arc
 * and lands a stride ahead, then the roles swap. Feet are static bodies whose
 * positions we set directly each tick (kinematic) — the pinned leg chain and
 * the hip spring follow them, so the legs bend and extend like real steps
 * while the torso is pushed forward to match the cadence.
 */

function createSwingState(): GaitState {
  return {
    phase: "stand",
    stepT: 0,
    stepDur: TUNING.WALK_STEP_TICKS,
    swingFromX: 0,
    swingToX: 0,
    lastDir: 0,
  };
}

export { createSwingState as createGaitState };

function plantFoot(foot: Matter.Body, x: number) {
  if (!foot.isStatic) Body.setStatic(foot, true);
  Body.setAngle(foot, 0);
  Body.setAngularVelocity(foot, 0);
  Body.setVelocity(foot, { x: 0, y: 0 });
  Body.setPosition(foot, { x, y: FOOT_Y });
}

function holdSwingFoot(foot: Matter.Body, x: number, y: number) {
  if (!foot.isStatic) Body.setStatic(foot, true);
  Body.setAngle(foot, 0);
  Body.setAngularVelocity(foot, 0);
  Body.setVelocity(foot, { x: 0, y: 0 });
  Body.setPosition(foot, { x, y });
}

/** Begin a swing with the trailing foot (or alternate from the previous step). */
function startStep(ragdoll: Ragdoll, dir: -1 | 1) {
  const g = ragdoll.gait;
  const { footL, footR } = ragdoll.parts;

  let swingLeft: boolean;
  if (g.phase === "swingL") {
    swingLeft = false;
  } else if (g.phase === "swingR") {
    swingLeft = true;
  } else {
    // From a standstill: step with whichever foot is trailing in travel dir.
    swingLeft = footL.position.x * dir < footR.position.x * dir;
  }

  const swingFoot = swingLeft ? footL : footR;
  const stanceFoot = swingLeft ? footR : footL;

  // The stance foot is the anchor for this step.
  plantFoot(stanceFoot, stanceFoot.position.x);

  g.phase = swingLeft ? "swingL" : "swingR";
  g.stepT = 0;
  g.stepDur = TUNING.WALK_STEP_TICKS;
  g.swingFromX = swingFoot.position.x;
  g.swingToX = stanceFoot.position.x + dir * TUNING.WALK_STEP_LENGTH;
}

/** Plant both feet where they currently are and return to a standing stance. */
function settle(ragdoll: Ragdoll) {
  const { footL, footR } = ragdoll.parts;
  plantFoot(footL, footL.position.x);
  plantFoot(footR, footR.position.x);
  ragdoll.gait.phase = "stand";
  ragdoll.gait.lastDir = 0;
  ragdoll.feetPlanted = true;
}

/**
 * Keep the torso balanced over its feet. Rather than shoving it at a fixed
 * speed (which lets it outrun its support base and sink the hips), we steer it
 * toward the center of the planted feet plus a small forward lean. As the feet
 * leapfrog ahead, the torso follows — so it always has a leg under it.
 */
function driveTorso(ragdoll: Ragdoll, dir: -1 | 1) {
  const { torso, footL, footR } = ragdoll.parts;
  const feetCenter = (footL.position.x + footR.position.x) * 0.5;
  const targetX = feetCenter + dir * TUNING.WALK_LEAD;
  let vx = (targetX - torso.position.x) * TUNING.WALK_TRACK;
  vx = Math.max(-TUNING.WALK_SPEED, Math.min(TUNING.WALK_SPEED, vx));
  Body.setVelocity(torso, { x: vx, y: torso.velocity.y });

  // Walking adds a continuous tipping torque (the body pivots over the planted
  // foot), so give the torso extra upright authority on top of the base PD.
  let angErr = -torso.angle;
  while (angErr > Math.PI) angErr -= Math.PI * 2;
  while (angErr < -Math.PI) angErr += Math.PI * 2;
  const av = torso.angularVelocity;
  Body.setAngularVelocity(
    torso,
    av + (angErr * 0.14 - av * 0.06) * TUNING.WALK_UPRIGHT_BOOST,
  );
}

/**
 * Advance the walk cycle one tick. `dir` is the desired travel direction
 * (-1 left, 0 stop, +1 right). Call only while the fighter is balanced/active.
 */
export function updateGait(ragdoll: Ragdoll, dir: -1 | 0 | 1) {
  const g = ragdoll.gait;
  const { footL, footR } = ragdoll.parts;

  if (dir === 0) {
    if (g.phase !== "stand") settle(ragdoll);
    else {
      // Keep both feet welded down while standing still.
      if (!footL.isStatic) plantFoot(footL, footL.position.x);
      if (!footR.isStatic) plantFoot(footR, footR.position.x);
      ragdoll.feetPlanted = true;
    }
    g.lastDir = 0;
    return;
  }

  ragdoll.feetPlanted = false;

  // (Re)start a step when standing or when the travel direction flipped.
  if (g.phase === "stand" || g.lastDir !== dir) {
    startStep(ragdoll, dir);
  }

  g.stepT += 1;
  const p = Math.min(1, g.stepT / g.stepDur);
  const swingFoot = g.phase === "swingL" ? footL : footR;
  const x = g.swingFromX + (g.swingToX - g.swingFromX) * p;
  const lift = TUNING.WALK_STEP_LIFT * Math.sin(Math.PI * p);
  holdSwingFoot(swingFoot, x, FOOT_Y - lift);

  if (p >= 1) {
    plantFoot(swingFoot, g.swingToX);
    startStep(ragdoll, dir); // alternate to the other foot
  }

  driveTorso(ragdoll, dir);
  g.lastDir = dir;
}
