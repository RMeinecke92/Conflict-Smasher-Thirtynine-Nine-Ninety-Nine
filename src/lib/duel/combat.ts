import Matter from "matter-js";

import { triggerCollapse } from "@/lib/lab/upright-control";

import { fighterBodies } from "@/lib/duel/fighter";
import type { Fighter } from "@/lib/duel/fighter";

const { Body } = Matter;

/** Minimum relative impact for a contact to count as a real strike. */
const MIN_IMPACT = 3;
const INVULN_MS = 360;
const FLASH_MS = 160;

type Lookup = {
  ownerOf: Map<number, 0 | 1>;
  isWeapon: Set<number>;
};

function buildLookup(fighters: [Fighter, Fighter]): Lookup {
  const ownerOf = new Map<number, 0 | 1>();
  const isWeapon = new Set<number>();
  for (const fighter of fighters) {
    for (const body of fighterBodies(fighter)) {
      ownerOf.set(body.id, fighter.index);
    }
    isWeapon.add(fighter.weapon.body.id);
  }
  return { ownerOf, isWeapon };
}

function impactStrength(weapon: Matter.Body, part: Matter.Body, reach: number): number {
  const dvx = weapon.velocity.x - part.velocity.x;
  const dvy = weapon.velocity.y - part.velocity.y;
  const linear = Math.hypot(dvx, dvy);
  const angular = Math.abs(weapon.angularVelocity) * reach * 0.4;
  return linear + angular;
}

function addKnockback(victim: Fighter, attacker: Fighter, dmg: number) {
  const push = 2.4 + dmg * 0.12;
  const dir = attacker.facing;
  for (const id of ["torso", "head"] as const) {
    const body = victim.ragdoll.parts[id];
    Body.setVelocity(body, {
      x: body.velocity.x + dir * push,
      y: body.velocity.y - push * 0.45,
    });
  }
}

/**
 * Returns a Matter `collisionStart` handler that resolves weapon-vs-body hits:
 * a live swing that touches the opposing fighter deals damage, knockback, and a
 * knockdown (which the lab balance system then recovers from).
 */
export function createCombatHandler(fighters: [Fighter, Fighter]) {
  const { ownerOf, isWeapon } = buildLookup(fighters);

  return (event: Matter.IEventCollision<Matter.Engine>) => {
    const now = performance.now();

    for (const pair of event.pairs) {
      const a = pair.bodyA;
      const b = pair.bodyB;
      const aOwner = ownerOf.get(a.id);
      const bOwner = ownerOf.get(b.id);
      if (aOwner === undefined || bOwner === undefined) continue;
      if (aOwner === bOwner) continue;

      let weapon: Matter.Body | null = null;
      let part: Matter.Body | null = null;
      let attackerIndex: 0 | 1 | undefined;
      let victimIndex: 0 | 1 | undefined;

      if (isWeapon.has(a.id) && !isWeapon.has(b.id)) {
        weapon = a;
        part = b;
        attackerIndex = aOwner;
        victimIndex = bOwner;
      } else if (isWeapon.has(b.id) && !isWeapon.has(a.id)) {
        weapon = b;
        part = a;
        attackerIndex = bOwner;
        victimIndex = aOwner;
      }

      if (!weapon || !part || attackerIndex === undefined || victimIndex === undefined) {
        continue;
      }

      const attacker = fighters[attackerIndex];
      const victim = fighters[victimIndex];

      if (!attacker.weaponLive || attacker.hasHit) continue;
      if (victim.hp <= 0 || now < victim.invulnUntil) continue;

      const strength = impactStrength(weapon, part, attacker.weapon.spec.reach);
      if (strength < MIN_IMPACT) continue;

      const dmg = attacker.weapon.spec.damage;
      victim.hp = Math.max(0, victim.hp - dmg);
      attacker.hasHit = true;
      victim.invulnUntil = now + INVULN_MS;
      victim.hitFlashUntil = now + FLASH_MS;

      addKnockback(victim, attacker, dmg);
      victim.balance = triggerCollapse(victim.balance, now);
    }
  };
}
