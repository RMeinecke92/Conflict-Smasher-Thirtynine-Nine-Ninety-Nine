import Matter from "matter-js";

import { createCharacterCollisionFilter } from "@/lib/lab/collision-groups";
import { FLOOR_Y, SEGMENT, VIEW_W } from "@/lib/lab/constants";
import { bodyWorldPoint } from "@/lib/lab/ragdoll-geometry";
import type { BodyPartId, Ragdoll } from "@/lib/lab/types";

const { Bodies, Body, Constraint, Vector } = Matter;

const JOINT = {
  stiffness: 0.92,
  damping: 0.14,
  length: 0,
} as const;

const LEG_JOINT = {
  stiffness: 0.99,
  damping: 0.2,
  length: 0,
} as const;

const WALK_SPEED_CAP = 2.4;

const NECK_JOINT = {
  stiffness: 0.55,
  damping: 0.08,
  length: 0,
} as const;

function partRect(
  x: number,
  y: number,
  w: number,
  h: number,
  filter: Matter.ICollisionFilter,
  options: Matter.IChamferableBodyDefinition = {},
) {
  return Bodies.rectangle(x, y, w, h, {
    collisionFilter: filter,
    friction: 0.8,
    frictionAir: 0.02,
    restitution: 0.05,
    ...options,
  });
}

function partCircle(
  x: number,
  y: number,
  r: number,
  filter: Matter.ICollisionFilter,
  options: Matter.IBodyDefinition = {},
) {
  return Bodies.circle(x, y, r, {
    collisionFilter: filter,
    friction: 0.8,
    frictionAir: 0.02,
    restitution: 0.05,
    ...options,
  });
}

type JointSettings = {
  stiffness: number;
  damping: number;
  length: number;
};

function pin(
  bodyA: Matter.Body,
  pointA: Matter.Vector,
  bodyB: Matter.Body,
  pointB: Matter.Vector,
  joint: JointSettings = JOINT,
) {
  return Constraint.create({
    bodyA,
    pointA,
    bodyB,
    pointB,
    ...joint,
  });
}

function pinLeg(
  bodyA: Matter.Body,
  pointA: Matter.Vector,
  bodyB: Matter.Body,
  pointB: Matter.Vector,
) {
  return pin(bodyA, pointA, bodyB, pointB, LEG_JOINT);
}

/** Soft hip–foot spring: holds leg chain extended when the foot is planted. */
function legSpring(
  torso: Matter.Body,
  hipLocal: Matter.Vector,
  foot: Matter.Body,
  length: number,
) {
  return Constraint.create({
    bodyA: torso,
    pointA: hipLocal,
    bodyB: foot,
    pointB: { x: 0, y: -SEGMENT.FOOT_H * 0.5 },
    stiffness: 0.88,
    damping: 0.24,
    length,
  });
}

export function createRagdoll(spawnX = VIEW_W * 0.5): Ragdoll {
  const filter = createCharacterCollisionFilter();
  const { TORSO_W, TORSO_H, HEAD_R, UPPER_LIMB_H, LOWER_LIMB_H, LIMB_W, HAND_R, FOOT_W, FOOT_H } =
    SEGMENT;

  const legSpan = UPPER_LIMB_H + LOWER_LIMB_H + FOOT_H;
  const torsoCenterY = FLOOR_Y - legSpan - TORSO_H * 0.45;
  const hipY = torsoCenterY + TORSO_H * 0.35;
  const shoulderY = torsoCenterY - TORSO_H * 0.35;
  const neckY = torsoCenterY - TORSO_H * 0.5 - HEAD_R;
  const shoulderOffset = TORSO_W * 0.55;
  const hipOffset = TORSO_W * 0.22;

  const halfTorsoH = TORSO_H * 0.5;
  const halfUpper = UPPER_LIMB_H * 0.5;
  const halfLower = LOWER_LIMB_H * 0.5;
  const halfFootH = FOOT_H * 0.5;
  const ankleLocalX = 0;

  const torso = partRect(spawnX, torsoCenterY, TORSO_W, TORSO_H, filter, {
    label: "torso",
    density: 0.004,
  });

  const head = partCircle(spawnX, neckY, HEAD_R, filter, {
    label: "head",
    density: 0.002,
  });

  const upperArmL = partRect(
    spawnX - shoulderOffset,
    shoulderY + halfUpper,
    LIMB_W,
    UPPER_LIMB_H,
    filter,
    { label: "upperArmL", density: 0.0015 },
  );
  const lowerArmL = partRect(
    spawnX - shoulderOffset,
    shoulderY + UPPER_LIMB_H + halfLower,
    LIMB_W,
    LOWER_LIMB_H,
    filter,
    { label: "lowerArmL", density: 0.0012 },
  );
  const handL = partCircle(
    spawnX - shoulderOffset,
    shoulderY + UPPER_LIMB_H + LOWER_LIMB_H + HAND_R,
    HAND_R,
    filter,
    { label: "handL", density: 0.001 },
  );

  const upperArmR = partRect(
    spawnX + shoulderOffset,
    shoulderY + halfUpper,
    LIMB_W,
    UPPER_LIMB_H,
    filter,
    { label: "upperArmR", density: 0.0015 },
  );
  const lowerArmR = partRect(
    spawnX + shoulderOffset,
    shoulderY + UPPER_LIMB_H + halfLower,
    LIMB_W,
    LOWER_LIMB_H,
    filter,
    { label: "lowerArmR", density: 0.0012 },
  );
  const handR = partCircle(
    spawnX + shoulderOffset,
    shoulderY + UPPER_LIMB_H + LOWER_LIMB_H + HAND_R,
    HAND_R,
    filter,
    { label: "handR", density: 0.001 },
  );

  const upperLegL = partRect(
    spawnX - hipOffset,
    hipY + halfUpper,
    LIMB_W,
    UPPER_LIMB_H,
    filter,
    { label: "upperLegL", density: 0.0012 },
  );
  const lowerLegL = partRect(
    spawnX - hipOffset,
    hipY + UPPER_LIMB_H + halfLower,
    LIMB_W,
    LOWER_LIMB_H,
    filter,
    { label: "lowerLegL", density: 0.001 },
  );
  const footL = partRect(
    spawnX - hipOffset,
    FLOOR_Y - halfFootH - 1,
    FOOT_W,
    FOOT_H,
    filter,
    {
      label: "footL",
      density: 0.002,
      friction: 1.8,
      frictionStatic: 2.5,
      chamfer: { radius: 2 },
    },
  );

  const upperLegR = partRect(
    spawnX + hipOffset,
    hipY + halfUpper,
    LIMB_W,
    UPPER_LIMB_H,
    filter,
    { label: "upperLegR", density: 0.0012 },
  );
  const lowerLegR = partRect(
    spawnX + hipOffset,
    hipY + UPPER_LIMB_H + halfLower,
    LIMB_W,
    LOWER_LIMB_H,
    filter,
    { label: "lowerLegR", density: 0.001 },
  );
  const footR = partRect(
    spawnX + hipOffset,
    FLOOR_Y - halfFootH - 1,
    FOOT_W,
    FOOT_H,
    filter,
    {
      label: "footR",
      density: 0.002,
      friction: 1.8,
      frictionStatic: 2.5,
      chamfer: { radius: 2 },
    },
  );

  const hipLocalL = { x: -hipOffset, y: halfTorsoH - 4 };
  const hipLocalR = { x: hipOffset, y: halfTorsoH - 4 };
  const spawnHipL = bodyWorldPoint(torso, hipLocalL);
  const spawnHipR = bodyWorldPoint(torso, hipLocalR);
  const restLegL = Vector.magnitude(Vector.sub(spawnHipL, footL.position));
  const restLegR = Vector.magnitude(Vector.sub(spawnHipR, footR.position));

  const constraints = [
    pin(torso, { x: 0, y: -halfTorsoH }, head, { x: 0, y: HEAD_R * 0.5 }, NECK_JOINT),
    pin(torso, { x: -TORSO_W * 0.35, y: -halfTorsoH + 4 }, upperArmL, { x: 0, y: -halfUpper }),
    pin(upperArmL, { x: 0, y: halfUpper }, lowerArmL, { x: 0, y: -halfLower }),
    pin(lowerArmL, { x: 0, y: halfLower }, handL, { x: 0, y: -HAND_R * 0.5 }),
    pin(torso, { x: TORSO_W * 0.35, y: -halfTorsoH + 4 }, upperArmR, { x: 0, y: -halfUpper }),
    pin(upperArmR, { x: 0, y: halfUpper }, lowerArmR, { x: 0, y: -halfLower }),
    pin(lowerArmR, { x: 0, y: halfLower }, handR, { x: 0, y: -HAND_R * 0.5 }),
    pinLeg(torso, hipLocalL, upperLegL, { x: 0, y: -halfUpper }),
    pinLeg(upperLegL, { x: 0, y: halfUpper }, lowerLegL, { x: 0, y: -halfLower }),
    pinLeg(lowerLegL, { x: 0, y: halfLower }, footL, { x: ankleLocalX, y: -halfFootH }),
    pinLeg(torso, hipLocalR, upperLegR, { x: 0, y: -halfUpper }),
    pinLeg(upperLegR, { x: 0, y: halfUpper }, lowerLegR, { x: 0, y: -halfLower }),
    pinLeg(lowerLegR, { x: 0, y: halfLower }, footR, { x: ankleLocalX, y: -halfFootH }),
    legSpring(torso, hipLocalL, footL, restLegL),
    legSpring(torso, hipLocalR, footR, restLegR),
  ];

  const parts: Record<BodyPartId, Matter.Body> = {
    torso,
    head,
    upperArmL,
    lowerArmL,
    handL,
    upperArmR,
    lowerArmR,
    handR,
    upperLegL,
    lowerLegL,
    footL,
    upperLegR,
    lowerLegR,
    footR,
  };

  const footY = FLOOR_Y - halfFootH - 1;
  Body.setStatic(footL, true);
  Body.setStatic(footR, true);
  Body.setAngle(footL, 0);
  Body.setAngle(footR, 0);
  Body.setPosition(footL, { x: spawnX - hipOffset, y: footY });
  Body.setPosition(footR, { x: spawnX + hipOffset, y: footY });

  return {
    id: filter.category,
    parts,
    constraints,
    spawnX,
    spawnHipY: (spawnHipL.y + spawnHipR.y) * 0.5,
    ageTicks: 0,
    feetPlanted: true,
  };
}

export function getRagdollBodies(ragdoll: Ragdoll): Matter.Body[] {
  return Object.values(ragdoll.parts);
}

export function findNearestPart(
  ragdoll: Ragdoll,
  worldX: number,
  worldY: number,
): BodyPartId {
  let nearest: BodyPartId = "torso";
  let bestDist = Infinity;

  for (const [id, body] of Object.entries(ragdoll.parts) as [BodyPartId, Matter.Body][]) {
    const dx = body.position.x - worldX;
    const dy = body.position.y - worldY;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      nearest = id;
    }
  }

  return nearest;
}

export function applyImpulseToPart(
  ragdoll: Ragdoll,
  partId: BodyPartId,
  worldX: number,
  worldY: number,
  magnitude: number,
) {
  const body = ragdoll.parts[partId];
  const dx = worldX - body.position.x;
  const dy = worldY - body.position.y;
  const len = Math.hypot(dx, dy) || 1;

  let nx = dx / len;
  let ny = dy / len;

  // Damp upward clicks — main cause of slow lift-off when spamming.
  if (ny < 0) {
    ny *= 0.25;
    const nLen = Math.hypot(nx, ny) || 1;
    nx /= nLen;
    ny /= nLen;
  }

  Body.applyForce(body, body.position, {
    x: nx * magnitude,
    y: ny * magnitude,
  });
}

export function applyWalkForce(ragdoll: Ragdoll, direction: -1 | 0 | 1, force: number) {
  if (direction === 0) return;
  const torso = ragdoll.parts.torso;
  const alreadyAtSpeed =
    Math.abs(torso.velocity.x) >= WALK_SPEED_CAP &&
    Math.sign(torso.velocity.x) === direction;
  if (alreadyAtSpeed) return;

  Body.applyForce(torso, torso.position, { x: direction * force, y: 0 });
}
