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
