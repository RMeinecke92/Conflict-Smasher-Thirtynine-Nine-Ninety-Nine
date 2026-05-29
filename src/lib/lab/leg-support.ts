import Matter from "matter-js";

import { gravityAccelPerStep } from "@/lib/lab/balance-math";
import { FLOOR_Y, SEGMENT } from "@/lib/lab/constants";
import { bodyWorldPoint } from "@/lib/lab/ragdoll-geometry";
import type { Ragdoll } from "@/lib/lab/types";

const { Body, Vector } = Matter;

const { TORSO_H, UPPER_LIMB_H, LOWER_LIMB_H, FOOT_H, TORSO_W } = SEGMENT;

const REST_LEG_LEN = UPPER_LIMB_H + LOWER_LIMB_H + FOOT_H * 0.5;
const HIP_LOCAL = { x: TORSO_W * 0.22, y: TORSO_H * 0.5 - 4 };

type LegSide = "L" | "R";

function legParts(ragdoll: Ragdoll, side: LegSide) {
  return side === "L"
    ? {
        upper: ragdoll.parts.upperLegL,
        lower: ragdoll.parts.lowerLegL,
        foot: ragdoll.parts.footL,
        hipX: -HIP_LOCAL.x,
      }
    : {
        upper: ragdoll.parts.upperLegR,
        lower: ragdoll.parts.lowerLegR,
        foot: ragdoll.parts.footR,
        hipX: HIP_LOCAL.x,
      };
}

function footGrounded(footY: number) {
  return footY >= FLOOR_Y - 14;
}

/**
 * When the foot is planted and the hip–foot chain is shorter than rest length,
 * push along the leg axis to re-extend — resists knee collapse without net hover.
 */
export function applyLegExtensionAssist(ragdoll: Ragdoll, strength: number) {
  if (strength <= 0) return;

  const torso = ragdoll.parts.torso;
  const gBudget = gravityAccelPerStep();
  const maxPush = gBudget * torso.mass * 0.75;

  for (const side of ["L", "R"] as LegSide[]) {
    const { foot } = legParts(ragdoll, side);
    if (!footGrounded(foot.position.y)) continue;

    const hip = bodyWorldPoint(torso, { x: legParts(ragdoll, side).hipX, y: HIP_LOCAL.y });
    const dx = hip.x - foot.position.x;
    const dy = hip.y - foot.position.y;
    const dist = Math.hypot(dx, dy) || 1;
    const compression = REST_LEG_LEN - dist;
    if (compression <= 1) continue;

    const nx = dx / dist;
    const ny = dy / dist;
    const forceMag = Math.min(compression * 0.00028 * strength, maxPush);

    Body.applyForce(torso, hip, { x: nx * forceMag, y: ny * forceMag });
    Body.applyForce(foot, foot.position, {
      x: -nx * forceMag * 0.25,
      y: -ny * forceMag * 0.25,
    });
  }
}

/**
 * If hips sank below spawn height while feet are down, apply capped upward support.
 */
export function applyHipHeightAssist(ragdoll: Ragdoll, strength: number) {
  if (strength <= 0) return;

  const { footL, footR, torso } = ragdoll.parts;
  if (!footGrounded(footL.position.y) || !footGrounded(footR.position.y)) return;

  const hipL = bodyWorldPoint(torso, { x: -HIP_LOCAL.x, y: HIP_LOCAL.y });
  const hipR = bodyWorldPoint(torso, { x: HIP_LOCAL.x, y: HIP_LOCAL.y });
  const hipY = (hipL.y + hipR.y) * 0.5;
  const sink = hipY - ragdoll.spawnHipY;
  if (sink <= 3) return;

  const gBudget = gravityAccelPerStep();
  const forceMag = Math.min((sink - 3) * 0.00022 * strength, gBudget * torso.mass * 1.35);
  Body.applyForce(torso, torso.position, { x: 0, y: -forceMag });
}

export function getHipHeight(ragdoll: Ragdoll): number {
  const torso = ragdoll.parts.torso;
  const hipL = bodyWorldPoint(torso, { x: -HIP_LOCAL.x, y: HIP_LOCAL.y });
  const hipR = bodyWorldPoint(torso, { x: HIP_LOCAL.x, y: HIP_LOCAL.y });
  return (hipL.y + hipR.y) * 0.5;
}

export function legAxisUnit(ragdoll: Ragdoll, side: LegSide) {
  const torso = ragdoll.parts.torso;
  const { foot, hipX } = legParts(ragdoll, side);
  const hip = bodyWorldPoint(torso, { x: hipX, y: HIP_LOCAL.y });
  const v = Vector.sub(foot.position, hip);
  return Vector.normalise(v);
}
