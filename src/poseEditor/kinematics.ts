import {
  BIND_OFFSETS,
  DEFAULT_SEGMENT_LENGTHS,
} from "./constants";
import type {
  BindOffsets,
  JointKey,
  PoseJSON,
  SegmentLengths,
  SkeletonLayout,
} from "./types";
import { addPoint, directionFromAngle, normalizeAngle } from "./utils";

export function computeSkeletonLayout(
  pose: Pick<PoseJSON, "rootPosition" | "rootRotation" | "joints">,
  lengths: SegmentLengths = DEFAULT_SEGMENT_LENGTHS,
  bindOffsets: BindOffsets = BIND_OFFSETS,
): SkeletonLayout {
  const root = { ...pose.rootPosition };
  const jointPositions = {} as SkeletonLayout["jointPositions"];
  const jointParentAngles = {} as SkeletonLayout["jointParentAngles"];
  const segments: SkeletonLayout["segments"] = [];

  const waistParent = pose.rootRotation;
  const waistWorld =
    waistParent + pose.joints.waist + bindOffsets.waist;
  jointPositions.waist = root;
  jointParentAngles.waist = waistParent;

  const shoulder = addPoint(root.x, root.y, waistWorld, lengths.torso);
  segments.push({
    id: "torso",
    x1: root.x,
    y1: root.y,
    x2: shoulder.x,
    y2: shoulder.y,
  });

  jointPositions.neck = shoulder;
  jointParentAngles.neck = waistWorld;
  const neckWorld = waistWorld + pose.joints.neck + bindOffsets.neck;
  const headTop = addPoint(shoulder.x, shoulder.y, neckWorld, lengths.head);
  segments.push({
    id: "head",
    x1: shoulder.x,
    y1: shoulder.y,
    x2: headTop.x,
    y2: headTop.y,
  });

  const shoulderLParent = waistWorld;
  jointPositions.shoulderL = shoulder;
  jointParentAngles.shoulderL = shoulderLParent;
  const shoulderLWorld =
    shoulderLParent + pose.joints.shoulderL + bindOffsets.shoulderL;
  const elbowL = addPoint(
    shoulder.x,
    shoulder.y,
    shoulderLWorld,
    lengths.upperArm,
  );
  segments.push({
    id: "upperArmL",
    x1: shoulder.x,
    y1: shoulder.y,
    x2: elbowL.x,
    y2: elbowL.y,
  });

  jointPositions.elbowL = elbowL;
  jointParentAngles.elbowL = shoulderLWorld;
  const elbowLWorld =
    shoulderLWorld + pose.joints.elbowL + bindOffsets.elbowL;
  const handL = addPoint(elbowL.x, elbowL.y, elbowLWorld, lengths.lowerArm);
  segments.push({
    id: "lowerArmL",
    x1: elbowL.x,
    y1: elbowL.y,
    x2: handL.x,
    y2: handL.y,
  });

  jointPositions.shoulderR = shoulder;
  jointParentAngles.shoulderR = shoulderLParent;
  const shoulderRWorld =
    shoulderLParent + pose.joints.shoulderR + bindOffsets.shoulderR;
  const elbowR = addPoint(
    shoulder.x,
    shoulder.y,
    shoulderRWorld,
    lengths.upperArm,
  );
  segments.push({
    id: "upperArmR",
    x1: shoulder.x,
    y1: shoulder.y,
    x2: elbowR.x,
    y2: elbowR.y,
  });

  jointPositions.elbowR = elbowR;
  jointParentAngles.elbowR = shoulderRWorld;
  const elbowRWorld =
    shoulderRWorld + pose.joints.elbowR + bindOffsets.elbowR;
  const handR = addPoint(elbowR.x, elbowR.y, elbowRWorld, lengths.lowerArm);
  segments.push({
    id: "lowerArmR",
    x1: elbowR.x,
    y1: elbowR.y,
    x2: handR.x,
    y2: handR.y,
  });

  const hipParent = pose.rootRotation;
  jointPositions.hipL = root;
  jointParentAngles.hipL = hipParent;
  const hipLWorld = hipParent + pose.joints.hipL + bindOffsets.hipL;
  const kneeL = addPoint(root.x, root.y, hipLWorld, lengths.upperLeg);
  segments.push({
    id: "upperLegL",
    x1: root.x,
    y1: root.y,
    x2: kneeL.x,
    y2: kneeL.y,
  });

  jointPositions.kneeL = kneeL;
  jointParentAngles.kneeL = hipLWorld;
  const kneeLWorld = hipLWorld + pose.joints.kneeL + bindOffsets.kneeL;
  const footL = addPoint(kneeL.x, kneeL.y, kneeLWorld, lengths.lowerLeg);
  segments.push({
    id: "lowerLegL",
    x1: kneeL.x,
    y1: kneeL.y,
    x2: footL.x,
    y2: footL.y,
  });

  jointPositions.hipR = root;
  jointParentAngles.hipR = hipParent;
  const hipRWorld = hipParent + pose.joints.hipR + bindOffsets.hipR;
  const kneeR = addPoint(root.x, root.y, hipRWorld, lengths.upperLeg);
  segments.push({
    id: "upperLegR",
    x1: root.x,
    y1: root.y,
    x2: kneeR.x,
    y2: kneeR.y,
  });

  jointPositions.kneeR = kneeR;
  jointParentAngles.kneeR = hipRWorld;
  const kneeRWorld = hipRWorld + pose.joints.kneeR + bindOffsets.kneeR;
  const footR = addPoint(kneeR.x, kneeR.y, kneeRWorld, lengths.lowerLeg);
  segments.push({
    id: "lowerLegR",
    x1: kneeR.x,
    y1: kneeR.y,
    x2: footR.x,
    y2: footR.y,
  });

  return {
    root,
    jointPositions,
    jointParentAngles,
    segments,
  };
}

/** Convert a world-space pointer direction into a local joint angle. */
export function worldPointToJointAngle(
  jointKey: JointKey,
  jointX: number,
  jointY: number,
  pointerX: number,
  pointerY: number,
  parentWorldAngle: number,
  bindOffset: number,
): number {
  const worldAngle = Math.atan2(pointerY - jointY, pointerX - jointX);
  return normalizeAngle(worldAngle - parentWorldAngle - bindOffset);
}

export function jointWorldAngle(
  jointKey: JointKey,
  layout: SkeletonLayout,
  pose: Pick<PoseJSON, "joints">,
  bindOffsets: BindOffsets = BIND_OFFSETS,
): number {
  return (
    layout.jointParentAngles[jointKey] +
    pose.joints[jointKey] +
    bindOffsets[jointKey]
  );
}

export function segmentEndPoint(
  startX: number,
  startY: number,
  worldAngle: number,
  length: number,
): { x: number; y: number } {
  const dir = directionFromAngle(worldAngle);
  return {
    x: startX + dir.x * length,
    y: startY + dir.y * length,
  };
}
