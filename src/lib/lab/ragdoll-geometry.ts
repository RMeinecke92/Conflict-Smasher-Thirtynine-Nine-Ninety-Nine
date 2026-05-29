import Matter from "matter-js";

import { SEGMENT } from "@/lib/lab/constants";
import type { Ragdoll } from "@/lib/lab/types";

const { Vector } = Matter;

/** World-space point on a body from a local offset. */
export function bodyWorldPoint(
  body: Matter.Body,
  local: Matter.Vector,
): Matter.Vector {
  return Vector.add(body.position, Vector.rotate(local, body.angle));
}

/** Match constraint anchor offsets in ragdoll.ts */
export function getStickSkeleton(ragdoll: Ragdoll) {
  const p = ragdoll.parts;
  const { TORSO_W, TORSO_H, FOOT_W, FOOT_H } = SEGMENT;
  const halfH = TORSO_H * 0.5;
  const hipX = TORSO_W * 0.22;
  const shoulderX = TORSO_W * 0.35;

  const neck = bodyWorldPoint(p.torso, { x: 0, y: -halfH });
  const hipL = bodyWorldPoint(p.torso, { x: -hipX, y: halfH - 4 });
  const hipR = bodyWorldPoint(p.torso, { x: hipX, y: halfH - 4 });
  const shoulderL = bodyWorldPoint(p.torso, { x: -shoulderX, y: -halfH + 4 });
  const shoulderR = bodyWorldPoint(p.torso, { x: shoulderX, y: -halfH + 4 });
  const pelvis = bodyWorldPoint(p.torso, { x: 0, y: halfH - 4 });

  const halfFootH = FOOT_H * 0.5;
  const ankleLocal = { x: 0, y: -halfFootH };

  return {
    neck,
    pelvis,
    head: p.head.position,
    shoulderL,
    shoulderR,
    hipL,
    hipR,
    upperArmL: p.upperArmL.position,
    lowerArmL: p.lowerArmL.position,
    handL: p.handL.position,
    upperArmR: p.upperArmR.position,
    lowerArmR: p.lowerArmR.position,
    handR: p.handR.position,
    upperLegL: p.upperLegL.position,
    lowerLegL: p.lowerLegL.position,
    ankleL: bodyWorldPoint(p.footL, ankleLocal),
    footL: p.footL.position,
    upperLegR: p.upperLegR.position,
    lowerLegR: p.lowerLegR.position,
    ankleR: bodyWorldPoint(p.footR, ankleLocal),
    footR: p.footR.position,
    footBodyL: p.footL,
    footBodyR: p.footR,
  };
}
