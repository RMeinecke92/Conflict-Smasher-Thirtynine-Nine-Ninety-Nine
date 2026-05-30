import Matter from "matter-js";

import { SEGMENT } from "@/lib/lab/constants";
import { bodyWorldPoint } from "@/lib/lab/ragdoll-geometry";
import { createRagdoll, getRagdollBodies } from "@/lib/lab/ragdoll";
import { createBalanceState } from "@/lib/lab/upright-control";
import type { BalanceState, Ragdoll } from "@/lib/lab/types";

import { WEAPONS, createWeaponBody } from "@/lib/duel/weapons";
import type { WeaponId, WeaponInstance } from "@/lib/duel/weapons";

const { Constraint } = Matter;

export type ActionName = "guard" | "windup" | "strike" | "recover" | "stagger";

export type ActionState = {
  name: ActionName;
  /** Ticks elapsed in the current action. */
  t: number;
  /** Ticks the current action lasts (0 = held until input changes). */
  dur: number;
};

export type ControllerKind = "human" | "cpu" | "dummy";

export type Fighter = {
  index: 0 | 1;
  /** +1 faces screen-right, -1 faces screen-left. */
  facing: 1 | -1;
  controller: ControllerKind;
  ragdoll: Ragdoll;
  weapon: WeaponInstance;
  /** Constraints binding the weapon grip to both hands. */
  bindConstraints: Matter.Constraint[];
  balance: BalanceState;
  action: ActionState;
  hp: number;
  maxHp: number;
  /** True only during the damaging part of a strike. */
  weaponLive: boolean;
  /** Prevents one swing from registering many hits. */
  hasHit: boolean;
  /** Timestamp (ms) until which the fighter cannot be hit again. */
  invulnUntil: number;
  /** Render-only flash timer (ms) when struck. */
  hitFlashUntil: number;
};

export const MAX_HP = 100;

export type FighterOptions = {
  index: 0 | 1;
  spawnX: number;
  facing: 1 | -1;
  weaponId: WeaponId;
  controller: ControllerKind;
};

/** Unique negative group per fighter so a fighter's own parts never collide,
 * but the two fighters (and their weapons) DO collide with each other. */
function fighterFilter(index: number): Matter.ICollisionFilter {
  return {
    group: -(index + 1),
    category: 0x0002,
    mask: 0xffff,
  };
}

export function createFighter(opts: FighterOptions): Fighter {
  const filter = fighterFilter(opts.index);
  const ragdoll = createRagdoll(opts.spawnX, filter);
  const spec = WEAPONS[opts.weaponId];

  const torso = ragdoll.parts.torso;
  const gripX = torso.position.x + opts.facing * 5;
  const gripY = torso.position.y - SEGMENT.TORSO_H * 0.18;

  const weapon = createWeaponBody(spec, gripX, gripY, filter);

  const bindLower = Constraint.create({
    bodyA: ragdoll.parts.handR,
    pointA: { x: 0, y: 0 },
    bodyB: weapon.body,
    pointB: weapon.gripLowerLocal,
    stiffness: 0.7,
    damping: 0.2,
    length: 0,
  });
  const bindUpper = Constraint.create({
    bodyA: ragdoll.parts.handL,
    pointA: { x: 0, y: 0 },
    bodyB: weapon.body,
    pointB: weapon.gripUpperLocal,
    stiffness: 0.55,
    damping: 0.2,
    length: 0,
  });

  return {
    index: opts.index,
    facing: opts.facing,
    controller: opts.controller,
    ragdoll,
    weapon,
    bindConstraints: [bindLower, bindUpper],
    balance: createBalanceState(),
    action: { name: "guard", t: 0, dur: 0 },
    hp: MAX_HP,
    maxHp: MAX_HP,
    weaponLive: false,
    hasHit: false,
    invulnUntil: 0,
    hitFlashUntil: 0,
  };
}

/** All Matter bodies belonging to a fighter (skeleton + weapon). */
export function fighterBodies(fighter: Fighter): Matter.Body[] {
  return [...getRagdollBodies(fighter.ragdoll), fighter.weapon.body];
}

export function fighterConstraints(fighter: Fighter): Matter.Constraint[] {
  return [...fighter.ragdoll.constraints, ...fighter.bindConstraints];
}

/** World-space tip of the weapon. */
export function weaponTip(fighter: Fighter): Matter.Vector {
  return bodyWorldPoint(fighter.weapon.body, fighter.weapon.tipLocal);
}

/** World-space butt of the weapon. */
export function weaponButt(fighter: Fighter): Matter.Vector {
  return bodyWorldPoint(fighter.weapon.body, fighter.weapon.buttLocal);
}
