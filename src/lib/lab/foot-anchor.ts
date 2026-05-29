import Matter from "matter-js";

import { FLOOR_Y, SEGMENT } from "@/lib/lab/constants";
import type { Ragdoll } from "@/lib/lab/types";

const { Body } = Matter;

const FOOT_Y = FLOOR_Y - SEGMENT.FOOT_H * 0.5 - 1;

function plantFoot(foot: Matter.Body, x: number) {
  Body.setStatic(foot, true);
  Body.setAngle(foot, 0);
  Body.setAngularVelocity(foot, 0);
  Body.setVelocity(foot, { x: 0, y: 0 });
  Body.setPosition(foot, { x, y: FOOT_Y });
}

function releaseFoot(foot: Matter.Body) {
  if (!foot.isStatic) return;
  Body.setStatic(foot, false);
}

/** Pin feet to the floor while idle-standing so the leg chain can support the hips. */
export function applyFootAnchors(
  ragdoll: Ragdoll,
  uprightStrength: number,
  walking: boolean,
) {
  const shouldPlant = uprightStrength > 0.45 && !walking;

  if (shouldPlant && !ragdoll.feetPlanted) {
    plantFoot(ragdoll.parts.footL, ragdoll.parts.footL.position.x);
    plantFoot(ragdoll.parts.footR, ragdoll.parts.footR.position.x);
    ragdoll.feetPlanted = true;
    return;
  }

  if (!shouldPlant && ragdoll.feetPlanted) {
    releaseFoot(ragdoll.parts.footL);
    releaseFoot(ragdoll.parts.footR);
    ragdoll.feetPlanted = false;
  }
}

export function releaseAllFootAnchors(ragdoll: Ragdoll) {
  releaseFoot(ragdoll.parts.footL);
  releaseFoot(ragdoll.parts.footR);
  ragdoll.feetPlanted = false;
}
