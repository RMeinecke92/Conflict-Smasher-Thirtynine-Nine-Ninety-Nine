import Matter from "matter-js";

import { measureKneeBendDeg } from "@/lib/lab/balance-math";
import { FLOOR_Y } from "@/lib/lab/constants";
import {
  applyHipHeightAssist,
  applyLegExtensionAssist,
  getHipHeight,
} from "@/lib/lab/leg-support";
import { applyFootAnchors } from "@/lib/lab/foot-anchor";
import { getBalanceParams } from "@/lib/lab/runtime-tuning";
import type { BalanceState, BodyPartId, Ragdoll } from "@/lib/lab/types";

import {
  getBalanceBudget,
  measureTiltFromVerticalDeg,
} from "./balance-math";

const { Body } = Matter;

const ARM_PARTS: BodyPartId[] = [
  "upperArmL",
  "lowerArmL",
  "handL",
  "upperArmR",
  "lowerArmR",
  "handR",
];

const LEG_CHAINS: [BodyPartId, BodyPartId][] = [
  ["upperLegL", "lowerLegL"],
  ["upperLegR", "lowerLegR"],
];

const KNEE_REST_BEND = 0.12;
const KNEE_COLLAPSE_DEG = 35;

export function createBalanceState(now = performance.now()): BalanceState {
  return {
    mode: "active",
    uprightStrength: 1,
    phaseStartedAt: now,
  };
}

function applyAngularPd(
  body: Matter.Body,
  targetAngle: number,
  kp: number,
  kd: number,
  strength: number,
) {
  let angleError = targetAngle - body.angle;
  while (angleError > Math.PI) angleError -= Math.PI * 2;
  while (angleError < -Math.PI) angleError += Math.PI * 2;

  const av = body.angularVelocity;
  const delta = (angleError * kp - av * kd) * strength;
  Body.setAngularVelocity(body, av + delta);
}

function clampVerticalSpeed(body: Matter.Body, max: number) {
  if (Math.abs(body.velocity.y) <= max) return;
  Body.setVelocity(body, {
    x: body.velocity.x,
    y: Math.sign(body.velocity.y) * max,
  });
}

const SPAWN_BOOST_TICKS = 120;
const SPAWN_BOOST_MULT = 2.5;

export function applyUprightTorque(
  ragdoll: Ragdoll,
  uprightStrength: number,
  walking = false,
) {
  if (uprightStrength <= 0) {
    applyFootAnchors(ragdoll, uprightStrength, true);
    return;
  }

  ragdoll.ageTicks += 1;
  const spawnBoost =
    ragdoll.ageTicks < SPAWN_BOOST_TICKS
      ? SPAWN_BOOST_MULT * (1 - ragdoll.ageTicks / SPAWN_BOOST_TICKS) + 1
      : 1;
  const effectiveStrength = uprightStrength * spawnBoost;

  applyFootAnchors(ragdoll, uprightStrength, walking);

  const params = getBalanceParams();
  const torso = ragdoll.parts.torso;
  const torsoAngle = torso.angle;

  applyAngularPd(
    torso,
    0,
    params.torsoUprightTorque,
    params.torsoUprightDamping,
    effectiveStrength,
  );

  for (const [upperId, lowerId] of LEG_CHAINS) {
    const upper = ragdoll.parts[upperId];
    const lower = ragdoll.parts[lowerId];
    const kneeBend = measureKneeBendDeg(upper.angle, lower.angle);
    const kneeBoost =
      kneeBend > KNEE_COLLAPSE_DEG
        ? 1 + (kneeBend - KNEE_COLLAPSE_DEG) / 90
        : 1;

    applyAngularPd(
      upper,
      torsoAngle,
      params.legStraightenTorque * kneeBoost,
      params.legStraightenDamping,
      effectiveStrength,
    );
    applyAngularPd(
      lower,
      upper.angle + KNEE_REST_BEND,
      params.legStraightenTorque * 0.65 * kneeBoost,
      params.legStraightenDamping,
      effectiveStrength,
    );
  }

  applyLegExtensionAssist(
    ragdoll,
    effectiveStrength * params.legExtensionStrength,
  );
  applyHipHeightAssist(ragdoll, effectiveStrength * params.hipSupportStrength);

  if (effectiveStrength > 0.3) {
    const damp = params.limbDamping * effectiveStrength;
    for (const id of ARM_PARTS) {
      const body = ragdoll.parts[id];
      Body.setAngularVelocity(body, body.angularVelocity * (1 - damp));
    }
  }

  const footY = Math.max(
    ragdoll.parts.footL.position.y,
    ragdoll.parts.footR.position.y,
  );
  if (footY >= FLOOR_Y - 24) {
    for (const body of Object.values(ragdoll.parts)) {
      clampVerticalSpeed(body, params.maxVerticalSpeed);
    }
  }
}

export function triggerCollapse(balance: BalanceState, now: number): BalanceState {
  if (balance.mode === "stunned" || balance.mode === "recovering") {
    return balance;
  }

  return {
    mode: "stunned",
    uprightStrength: 0,
    phaseStartedAt: now,
  };
}

export function updateBalanceState(balance: BalanceState, now: number): BalanceState {
  if (balance.mode === "active") {
    return { ...balance, uprightStrength: 1 };
  }

  const elapsed = now - balance.phaseStartedAt;

  if (balance.mode === "stunned") {
    if (elapsed >= 1000) {
      return {
        mode: "recovering",
        uprightStrength: 0,
        phaseStartedAt: now,
      };
    }
    return { ...balance, uprightStrength: 0 };
  }

  const t = Math.min(1, elapsed / 2000);

  if (t >= 1) {
    return {
      mode: "active",
      uprightStrength: 1,
      phaseStartedAt: now,
    };
  }

  return {
    ...balance,
    uprightStrength: t,
  };
}

export function getBalanceDebug(ragdoll: Ragdoll) {
  const torso = ragdoll.parts.torso;
  const budget = getBalanceBudget();
  const params = getBalanceParams();
  const kneeL = measureKneeBendDeg(
    ragdoll.parts.upperLegL.angle,
    ragdoll.parts.lowerLegL.angle,
  );
  const kneeR = measureKneeBendDeg(
    ragdoll.parts.upperLegR.angle,
    ragdoll.parts.lowerLegR.angle,
  );

  return {
    headY: ragdoll.parts.head.position.y,
    hipY: getHipHeight(ragdoll),
    spawnHipY: ragdoll.spawnHipY,
    footY: Math.max(
      ragdoll.parts.footL.position.y,
      ragdoll.parts.footR.position.y,
    ),
    angleDeg: measureTiltFromVerticalDeg(torso.angle),
    angularVelocity: torso.angularVelocity,
    kneeBendDeg: (kneeL + kneeR) * 0.5,
    gravityPerStep: budget.gravityPerStep,
    maxSafeUpwardPerMass: budget.maxSafeUpwardPerMass,
    params,
  };
}
