import type { PoseJSON } from "./types";

export function poseToJsonString(pose: PoseJSON): string {
  return JSON.stringify(pose, null, 2);
}

export function parsePoseJson(raw: string): PoseJSON {
  const data = JSON.parse(raw) as Partial<PoseJSON>;
  if (!data.name || typeof data.name !== "string") {
    throw new Error("Pose JSON missing string field: name");
  }
  if (!data.character || typeof data.character !== "string") {
    throw new Error("Pose JSON missing string field: character");
  }
  if (
    !data.rootPosition ||
    typeof data.rootPosition.x !== "number" ||
    typeof data.rootPosition.y !== "number"
  ) {
    throw new Error("Pose JSON missing rootPosition { x, y }");
  }
  if (typeof data.rootRotation !== "number") {
    throw new Error("Pose JSON missing number field: rootRotation");
  }
  if (!data.joints || typeof data.joints !== "object") {
    throw new Error("Pose JSON missing joints object");
  }

  const requiredJoints = [
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

  for (const key of requiredJoints) {
    if (typeof data.joints[key] !== "number") {
      throw new Error(`Pose JSON joints.${key} must be a number`);
    }
  }

  return {
    name: data.name,
    character: data.character,
    rootPosition: {
      x: data.rootPosition.x,
      y: data.rootPosition.y,
    },
    rootRotation: data.rootRotation,
    joints: {
      waist: data.joints.waist,
      neck: data.joints.neck,
      shoulderL: data.joints.shoulderL,
      shoulderR: data.joints.shoulderR,
      elbowL: data.joints.elbowL,
      elbowR: data.joints.elbowR,
      hipL: data.joints.hipL,
      hipR: data.joints.hipR,
      kneeL: data.joints.kneeL,
      kneeR: data.joints.kneeR,
    },
    ...(data.notes !== undefined ? { notes: data.notes } : {}),
    ...(data.referenceImage !== undefined
      ? { referenceImage: data.referenceImage }
      : {}),
  };
}

export function downloadPoseJson(pose: PoseJSON): void {
  const blob = new Blob([poseToJsonString(pose)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${pose.name}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
