import type { BindOffsets, JointKey, SegmentLengths } from "./types";

/**
 * Canvas uses Y-down coordinates: screen "up" is negative Y.
 * Character faces +X (screen-right) in the default bind pose.
 */
export const DEFAULT_SEGMENT_LENGTHS: SegmentLengths = {
  torso: 28,
  head: 18,
  upperArm: 26,
  lowerArm: 24,
  upperLeg: 32,
  lowerLeg: 30,
};

/** Local bind offsets so all joint angles at 0 produce an upright T-pose facing +X. */
export const BIND_OFFSETS: BindOffsets = {
  waist: -Math.PI / 2,
  neck: 0,
  shoulderL: -Math.PI / 2,
  shoulderR: Math.PI / 2,
  elbowL: 0,
  elbowR: 0,
  hipL: Math.PI / 2,
  hipR: Math.PI / 2,
  kneeL: 0,
  kneeR: 0,
};

export const JOINT_KEYS: readonly JointKey[] = [
  "waist",
  "neck",
  "shoulderL",
  "shoulderR",
  "elbowL",
  "elbowR",
  "hipL",
  "hipR",
  "kneeL",
  "kneeR",
] as const;

export const JOINT_LABELS: Record<JointKey, string> = {
  waist: "Waist",
  neck: "Neck",
  shoulderL: "Shoulder L",
  shoulderR: "Shoulder R",
  elbowL: "Elbow L",
  elbowR: "Elbow R",
  hipL: "Hip L",
  hipR: "Hip R",
  kneeL: "Knee L",
  kneeR: "Knee R",
};

/** Min/max local joint angle sliders (radians). */
export const JOINT_ANGLE_LIMITS: Record<JointKey, { min: number; max: number }> =
  {
    waist: { min: -Math.PI / 2, max: Math.PI / 2 },
    neck: { min: -Math.PI / 3, max: Math.PI / 3 },
    shoulderL: { min: -Math.PI, max: Math.PI },
    shoulderR: { min: -Math.PI, max: Math.PI },
    elbowL: { min: -Math.PI * 0.95, max: 0.2 },
    elbowR: { min: -Math.PI * 0.95, max: 0.2 },
    hipL: { min: -Math.PI / 2, max: Math.PI / 2 },
    hipR: { min: -Math.PI / 2, max: Math.PI / 2 },
    kneeL: { min: -0.15, max: Math.PI * 0.85 },
    kneeR: { min: -0.15, max: Math.PI * 0.85 },
  };

export const CANVAS_WIDTH = 720;
export const CANVAS_HEIGHT = 480;
export const JOINT_HIT_RADIUS = 18;
