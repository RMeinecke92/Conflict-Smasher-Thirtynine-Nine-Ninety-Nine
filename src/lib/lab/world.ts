import Matter from "matter-js";

import { GRAVITY } from "@/lib/lab/balance-math";
import { GROUND_COLLISION } from "@/lib/lab/collision-groups";
import { VIEW_W, VIEW_H, FLOOR_Y } from "@/lib/lab/constants";
import { releaseAllFootAnchors } from "@/lib/lab/foot-anchor";
import { createRagdoll, getRagdollBodies } from "@/lib/lab/ragdoll";
import type { LabWorld } from "@/lib/lab/types";

const { Bodies, Composite, Engine, World } = Matter;

export function createLabWorld(): LabWorld {
  const engine = Engine.create({
    gravity: { x: GRAVITY.x, y: GRAVITY.y, scale: GRAVITY.scale },
  });
  engine.positionIterations = 10;
  engine.velocityIterations = 8;
  engine.constraintIterations = 3;

  const ground = Bodies.rectangle(VIEW_W * 0.5, FLOOR_Y + 24, VIEW_W + 80, 48, {
    isStatic: true,
    label: "ground",
    friction: 1,
    collisionFilter: GROUND_COLLISION,
  });

  const character = createRagdoll();
  const bodies = getRagdollBodies(character);

  World.add(engine.world, [ground, ...bodies, ...character.constraints]);

  return { engine, ground, character };
}

export function resetCharacter(world: LabWorld): LabWorld {
  const oldBodies = getRagdollBodies(world.character);
  releaseAllFootAnchors(world.character);
  Composite.remove(world.engine.world, [
    ...oldBodies,
    ...world.character.constraints,
  ]);

  const character = createRagdoll();
  const bodies = getRagdollBodies(character);
  World.add(world.engine.world, [...bodies, ...character.constraints]);

  return { ...world, character };
}

export function stepWorld(engine: Matter.Engine, dtMs: number) {
  Engine.update(engine, dtMs);
}

export function resetLabWorld(world: LabWorld): LabWorld {
  World.clear(world.engine.world, false);
  Engine.clear(world.engine);
  return createLabWorld();
}

export function getWorldBounds() {
  return { width: VIEW_W, height: VIEW_H };
}
