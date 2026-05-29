import type { PoseJSON, PoseJoints } from "./types";

function mirrorJoints(joints: PoseJoints): PoseJoints {
  return {
    waist: -joints.waist,
    neck: -joints.neck,
    shoulderL: -joints.shoulderR,
    shoulderR: -joints.shoulderL,
    elbowL: -joints.elbowR,
    elbowR: -joints.elbowL,
    hipL: -joints.hipR,
    hipR: -joints.hipL,
    kneeL: -joints.kneeR,
    kneeR: -joints.kneeL,
  };
}

/** Produce a left-right mirrored copy of a pose (swap L/R, negate symmetric angles). */
export function mirrorPose(pose: PoseJSON): PoseJSON {
  const baseName = pose.name.endsWith("_mirror")
    ? pose.name.slice(0, -"_mirror".length)
    : pose.name;

  return {
    ...pose,
    name: `${baseName}_mirror`,
    rootPosition: { ...pose.rootPosition },
    rootRotation: -pose.rootRotation,
    joints: mirrorJoints(pose.joints),
  };
}
