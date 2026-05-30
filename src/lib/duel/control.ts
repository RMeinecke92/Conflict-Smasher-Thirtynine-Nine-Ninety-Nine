import Matter from "matter-js";

import { bodyWorldPoint } from "@/lib/lab/ragdoll-geometry";
import { updateGait } from "@/lib/lab/gait";
import { applyUprightTorque, updateBalanceState } from "@/lib/lab/upright-control";

import type { Fighter } from "@/lib/duel/fighter";

const { Body } = Matter;

export type FighterInput = {
  move: -1 | 0 | 1;
  /** Held: keep the weapon high in long guard. */
  guard: boolean;
  /** Edge: begin a strike (chop). */
  strikePressed: boolean;
};

export const IDLE_INPUT: FighterInput = {
  move: 0,
  guard: true,
  strikePressed: false,
};

type Pose = {
  /** Hand anchor offset from the torso (local; x is mirrored by facing). */
  hand: Matter.Vector;
  /** Weapon world angle (0 = tip up); mirrored by facing. */
  weaponAngle: number;
};

const POSE_GUARD: Pose = { hand: { x: 12, y: -22 }, weaponAngle: 0.22 };
const POSE_WINDUP: Pose = { hand: { x: -8, y: -36 }, weaponAngle: -0.55 };
const POSE_STRIKE: Pose = { hand: { x: 32, y: -2 }, weaponAngle: 2.15 };
const POSE_STAGGER: Pose = { hand: { x: 4, y: 4 }, weaponAngle: 0.6 };

const HAND_SPRING_K = 0.011;
const HAND_SPRING_D = 0.05;
const HAND_FORCE_CAP = 0.02;
const WEAPON_KD = 0.1;
const WEAPON_MAX_ANGULAR = 0.9;

function smoothstep(p: number): number {
  const t = Math.min(1, Math.max(0, p));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    hand: { x: lerp(a.hand.x, b.hand.x, t), y: lerp(a.hand.y, b.hand.y, t) },
    weaponAngle: lerp(a.weaponAngle, b.weaponAngle, t),
  };
}

/** Advance the action state machine from input. */
function advanceAction(fighter: Fighter, input: FighterInput, staggered: boolean) {
  const a = fighter.action;

  if (staggered) {
    if (a.name !== "stagger") {
      fighter.action = { name: "stagger", t: 0, dur: 0 };
      fighter.weaponLive = false;
      fighter.hasHit = false;
    } else {
      a.t += 1;
    }
    return;
  }

  const spec = fighter.weapon.spec;

  switch (a.name) {
    case "stagger":
      fighter.action = { name: "guard", t: 0, dur: 0 };
      break;
    case "guard":
      if (input.strikePressed) {
        fighter.action = { name: "windup", t: 0, dur: spec.windupTicks };
      }
      break;
    case "windup":
      a.t += 1;
      if (a.t >= a.dur) {
        fighter.action = { name: "strike", t: 0, dur: spec.activeTicks };
        fighter.weaponLive = true;
        fighter.hasHit = false;
      }
      break;
    case "strike":
      a.t += 1;
      if (a.t >= a.dur) {
        fighter.action = { name: "recover", t: 0, dur: spec.recoverTicks };
        fighter.weaponLive = false;
      }
      break;
    case "recover":
      a.t += 1;
      if (a.t >= a.dur) {
        fighter.action = { name: "guard", t: 0, dur: 0 };
      }
      break;
  }
}

function currentPose(fighter: Fighter): Pose {
  const a = fighter.action;
  const p = a.dur > 0 ? smoothstep(a.t / a.dur) : 0;
  switch (a.name) {
    case "guard":
      return POSE_GUARD;
    case "windup":
      return lerpPose(POSE_GUARD, POSE_WINDUP, p);
    case "strike":
      return lerpPose(POSE_WINDUP, POSE_STRIKE, p);
    case "recover":
      return lerpPose(POSE_STRIKE, POSE_GUARD, p);
    case "stagger":
      return POSE_STAGGER;
  }
}

function springHandToward(
  hand: Matter.Body,
  target: Matter.Vector,
  strength: number,
) {
  const k = HAND_SPRING_K * strength;
  const d = HAND_SPRING_D * strength;
  let fx = (target.x - hand.position.x) * k - hand.velocity.x * d;
  let fy = (target.y - hand.position.y) * k - hand.velocity.y * d;
  const mag = Math.hypot(fx, fy);
  if (mag > HAND_FORCE_CAP) {
    const s = HAND_FORCE_CAP / mag;
    fx *= s;
    fy *= s;
  }
  Body.applyForce(hand, hand.position, { x: fx * hand.mass, y: fy * hand.mass });
}

function driveWeaponAngle(
  weapon: Matter.Body,
  targetAngle: number,
  kp: number,
  strength: number,
) {
  if (strength <= 0) return;
  let err = targetAngle - weapon.angle;
  while (err > Math.PI) err -= Math.PI * 2;
  while (err < -Math.PI) err += Math.PI * 2;

  const av = weapon.angularVelocity;
  let next = av + (err * kp - av * WEAPON_KD) * strength;
  next = Math.min(WEAPON_MAX_ANGULAR, Math.max(-WEAPON_MAX_ANGULAR, next));
  Body.setAngularVelocity(weapon, next);
}

/**
 * One physics tick of control for a fighter: run the action machine, hold the
 * body upright, spring the hands into the current pose, orient the weapon, and
 * apply walk movement.
 */
export function stepFighterControl(fighter: Fighter, input: FighterInput, now: number) {
  fighter.balance = updateBalanceState(fighter.balance, now);
  const strength = fighter.balance.uprightStrength;
  const staggered = fighter.balance.mode !== "active";

  advanceAction(fighter, input, staggered);

  const moving = !staggered && input.move !== 0 && fighter.action.name === "guard";
  applyUprightTorque(fighter.ragdoll, strength);

  // The gait owns the feet while the fighter is balanced: stepping when moving,
  // both feet planted when still. While staggered/knocked down the feet ragdoll.
  if (!staggered) {
    updateGait(fighter.ragdoll, moving ? input.move : 0);
  }

  const pose = currentPose(fighter);
  const torso = fighter.ragdoll.parts.torso;
  const leadTarget = bodyWorldPoint(torso, {
    x: fighter.facing * pose.hand.x,
    y: pose.hand.y,
  });
  const rearTarget = bodyWorldPoint(torso, {
    x: fighter.facing * (pose.hand.x - 6),
    y: pose.hand.y + 8,
  });

  const armStrength = Math.max(0.25, strength);
  springHandToward(fighter.ragdoll.parts.handL, leadTarget, armStrength);
  springHandToward(fighter.ragdoll.parts.handR, rearTarget, armStrength);

  if (!staggered) {
    driveWeaponAngle(
      fighter.weapon.body,
      fighter.facing * pose.weaponAngle,
      fighter.weapon.spec.raiseStrength,
      strength,
    );
  }
}
