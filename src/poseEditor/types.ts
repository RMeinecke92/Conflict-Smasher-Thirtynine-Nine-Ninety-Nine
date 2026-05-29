/** Joint angle keys stored in pose JSON (radians, relative to parent segment). */
export type JointKey =
  | "waist"
  | "neck"
  | "shoulderL"
  | "shoulderR"
  | "elbowL"
  | "elbowR"
  | "hipL"
  | "hipR"
  | "kneeL"
  | "kneeR";

export type PoseJoints = Record<JointKey, number>;

export type PoseJSON = {
  name: string;
  character: string;
  rootPosition: { x: number; y: number };
  rootRotation: number;
  joints: PoseJoints;
  notes?: string;
  referenceImage?: string;
};

/** Drawable bone segment between two world-space points. */
export type BoneSegment = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/** Computed skeleton layout for rendering and hit-testing. */
export type SkeletonLayout = {
  root: { x: number; y: number };
  /** World position of each joint hinge (rotation pivot). */
  jointPositions: Record<JointKey, { x: number; y: number }>;
  /** Parent world angle (radians) used when converting drag to local joint angle. */
  jointParentAngles: Record<JointKey, number>;
  segments: BoneSegment[];
};

export type SegmentLengths = {
  torso: number;
  head: number;
  upperArm: number;
  lowerArm: number;
  upperLeg: number;
  lowerLeg: number;
};

/** Bind-pose local offsets (radians) so joint angle 0 matches T-pose. */
export type BindOffsets = Record<JointKey, number>;
