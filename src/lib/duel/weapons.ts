import Matter from "matter-js";

const { Bodies, Body, Vector } = Matter;

export type WeaponId = "longsword" | "poleHammer";

/**
 * Weapons are data (Master Stroke: "weapons are characters").
 * The four numbers that matter: length (reach), mass, raise speed, and the
 * damage/knockback the impact delivers. A heavy pole hammer is slower to bring
 * up but lands harder; the longsword is quicker but lighter.
 */
export type WeaponSpec = {
  id: WeaponId;
  name: string;
  /** Shaft length in world units (also the visual reach). */
  length: number;
  width: number;
  shaftDensity: number;
  /** Hammer head radius at the tip; 0 means no head (sword). */
  headRadius: number;
  headDensity: number;
  color: string;
  /** Approx tip reach for CPU spacing. */
  reach: number;
  /** Base damage on a clean strike. */
  damage: number;
  /** Knockback impulse scale applied to the victim. */
  knockback: number;
  /** PD gain for orienting the weapon — lighter weapons orient faster. */
  raiseStrength: number;
  /** Frames of wind-up / active / recovery for a strike. */
  windupTicks: number;
  activeTicks: number;
  recoverTicks: number;
};

export const WEAPONS: Record<WeaponId, WeaponSpec> = {
  longsword: {
    id: "longsword",
    name: "Longsword",
    length: 84,
    width: 5,
    shaftDensity: 0.0016,
    headRadius: 0,
    headDensity: 0,
    color: "#e2e8f0",
    reach: 84,
    damage: 13,
    knockback: 0.05,
    raiseStrength: 0.34,
    windupTicks: 9,
    activeTicks: 6,
    recoverTicks: 14,
  },
  poleHammer: {
    id: "poleHammer",
    name: "Pole Hammer",
    length: 116,
    width: 5,
    shaftDensity: 0.0014,
    headRadius: 9,
    headDensity: 0.013,
    color: "#b45309",
    reach: 122,
    damage: 22,
    knockback: 0.095,
    raiseStrength: 0.22,
    windupTicks: 15,
    activeTicks: 8,
    recoverTicks: 20,
  },
};

export type WeaponInstance = {
  spec: WeaponSpec;
  body: Matter.Body;
  /** Local anchor (COM-relative, unrotated) for the rear hand near the butt. */
  gripLowerLocal: Matter.Vector;
  /** Local anchor for the lead hand a little up the shaft. */
  gripUpperLocal: Matter.Vector;
  /** Local point at the very butt (for drawing). */
  buttLocal: Matter.Vector;
  /** Local point at the striking tip (for drawing + hit feel). */
  tipLocal: Matter.Vector;
};

/**
 * Build a weapon body standing vertical (tip up) with its grip near
 * (gripX, gripY). Returns the body plus local anchor points so the fighter can
 * bind it to both hands and the renderer can draw it.
 */
export function createWeaponBody(
  spec: WeaponSpec,
  gripX: number,
  gripY: number,
  filter: Matter.ICollisionFilter,
): WeaponInstance {
  const gripInset = spec.length * 0.16;
  const centerY = gripY + gripInset - spec.length * 0.5;
  const tipY = gripY + gripInset - spec.length;
  const buttY = gripY + gripInset;

  const shaft = Bodies.rectangle(gripX, centerY, spec.width, spec.length, {
    density: spec.shaftDensity,
    friction: 0.6,
    frictionAir: 0.02,
    restitution: 0.05,
    chamfer: { radius: 1 },
  });

  let body: Matter.Body;
  if (spec.headRadius > 0) {
    const head = Bodies.circle(gripX, tipY, spec.headRadius, {
      density: spec.headDensity,
      friction: 0.6,
      frictionAir: 0.02,
      restitution: 0.05,
    });
    body = Body.create({
      parts: [shaft, head],
      collisionFilter: filter,
      label: "weapon",
      frictionAir: 0.02,
    });
  } else {
    body = shaft;
    body.label = "weapon";
    body.collisionFilter = filter;
  }

  const pos = body.position;
  const local = (x: number, y: number): Matter.Vector =>
    Vector.sub({ x, y }, pos);

  return {
    spec,
    body,
    gripLowerLocal: local(gripX, buttY),
    gripUpperLocal: local(gripX, gripY - spec.length * 0.2),
    buttLocal: local(gripX, buttY),
    tipLocal: local(gripX, tipY),
  };
}
