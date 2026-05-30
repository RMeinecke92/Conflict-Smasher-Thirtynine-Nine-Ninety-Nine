import Matter from "matter-js";

import { GRAVITY } from "@/lib/lab/balance-math";
import { GROUND_COLLISION } from "@/lib/lab/collision-groups";
import { FLOOR_Y, VIEW_W } from "@/lib/lab/constants";

import { createCombatHandler } from "@/lib/duel/combat";
import { stepFighterControl } from "@/lib/duel/control";
import type { FighterInput } from "@/lib/duel/control";
import { createFighter, fighterBodies, fighterConstraints } from "@/lib/duel/fighter";
import type { ControllerKind, Fighter } from "@/lib/duel/fighter";
import { resetCpu } from "@/lib/duel/cpu";
import type { WeaponId } from "@/lib/duel/weapons";

const { Bodies, Engine, Events, World } = Matter;

export type DuelConfig = {
  p1Weapon: WeaponId;
  p2Weapon: WeaponId;
  /** What controls fighter 2. */
  p2Controller: ControllerKind;
};

export type DuelStatus = "fighting" | "ko";

export type DuelWorld = {
  engine: Matter.Engine;
  ground: Matter.Body;
  fighters: [Fighter, Fighter];
  config: DuelConfig;
  status: DuelStatus;
  winner: 0 | 1 | null;
  koAt: number;
  collisionHandler: (event: Matter.IEventCollision<Matter.Engine>) => void;
};

const SPAWN_LEFT = VIEW_W * 0.34;
const SPAWN_RIGHT = VIEW_W * 0.66;

export function createDuelWorld(config: DuelConfig): DuelWorld {
  resetCpu();

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

  const p1 = createFighter({
    index: 0,
    spawnX: SPAWN_LEFT,
    facing: 1,
    weaponId: config.p1Weapon,
    controller: "human",
  });
  const p2 = createFighter({
    index: 1,
    spawnX: SPAWN_RIGHT,
    facing: -1,
    weaponId: config.p2Weapon,
    controller: config.p2Controller,
  });

  const fighters: [Fighter, Fighter] = [p1, p2];

  World.add(engine.world, [
    ground,
    ...fighterBodies(p1),
    ...fighterConstraints(p1),
    ...fighterBodies(p2),
    ...fighterConstraints(p2),
  ]);

  const collisionHandler = createCombatHandler(fighters);
  Events.on(engine, "collisionStart", collisionHandler);

  return {
    engine,
    ground,
    fighters,
    config,
    status: "fighting",
    winner: null,
    koAt: 0,
    collisionHandler,
  };
}

/** Advance one fixed physics tick with the given inputs. */
export function stepDuelWorld(
  world: DuelWorld,
  inputs: [FighterInput, FighterInput],
  tickMs: number,
  now: number,
) {
  stepFighterControl(world.fighters[0], inputs[0], now);
  stepFighterControl(world.fighters[1], inputs[1], now);

  Engine.update(world.engine, tickMs);

  if (world.status === "fighting") {
    const [p1, p2] = world.fighters;
    if (p1.hp <= 0 || p2.hp <= 0) {
      world.status = "ko";
      world.winner = p1.hp <= 0 ? 1 : 0;
      world.koAt = now;
    }
  }
}

export function destroyDuelWorld(world: DuelWorld) {
  Events.off(world.engine, "collisionStart", world.collisionHandler);
  World.clear(world.engine.world, false);
  Engine.clear(world.engine);
}

/** Tear down and rebuild a fresh match with the same (or new) config. */
export function resetDuelWorld(world: DuelWorld, config = world.config): DuelWorld {
  destroyDuelWorld(world);
  return createDuelWorld(config);
}
