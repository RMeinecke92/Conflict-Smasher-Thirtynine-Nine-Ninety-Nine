import type { Body, Constraint, Engine } from "matter-js";

export type CharacterState = "active" | "stunned" | "recovering";

export type BodyPartId =
  | "torso"
  | "head"
  | "upperArmL"
  | "lowerArmL"
  | "handL"
  | "upperArmR"
  | "lowerArmR"
  | "handR"
  | "upperLegL"
  | "lowerLegL"
  | "footL"
  | "upperLegR"
  | "lowerLegR"
  | "footR";

/** Which foot (if any) is mid-swing during a walk cycle. */
export type GaitPhase = "stand" | "swingL" | "swingR";

export type GaitState = {
  phase: GaitPhase;
  /** Ticks elapsed in the current swing. */
  stepT: number;
  /** Ticks the current swing lasts. */
  stepDur: number;
  /** Swing foot start / target x for interpolation. */
  swingFromX: number;
  swingToX: number;
  /** Last walk direction we processed (-1, 0, 1). */
  lastDir: -1 | 0 | 1;
};

export type Ragdoll = {
  id: number;
  parts: Record<BodyPartId, Body>;
  constraints: Constraint[];
  spawnX: number;
  /** Reference hip height at spawn — used to detect sink/collapse. */
  spawnHipY: number;
  /** Physics ticks since spawn — used for spawn stabilization boost. */
  ageTicks: number;
  /** Feet pinned static while idle-standing — released for walk / ragdoll. */
  feetPlanted: boolean;
  /** Procedural walk-cycle state. */
  gait: GaitState;
};

export type LabWorld = {
  engine: Engine;
  ground: Body;
  character: Ragdoll;
};

export type BalanceState = {
  mode: CharacterState;
  uprightStrength: number;
  phaseStartedAt: number;
};
