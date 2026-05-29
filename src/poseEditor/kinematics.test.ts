import { describe, expect, it } from "vitest";

import { BIND_OFFSETS, DEFAULT_SEGMENT_LENGTHS } from "./constants";
import {
  computeSkeletonLayout,
  segmentEndPoint,
  worldPointToJointAngle,
} from "./kinematics";
import { createTPose } from "./tpose";
import { addPoint } from "./utils";

describe("computeSkeletonLayout", () => {
  it("places T-pose torso upright (negative Y) when all joint angles are zero", () => {
    const pose = createTPose();
    const layout = computeSkeletonLayout(pose);

    expect(layout.root).toEqual(pose.rootPosition);
    expect(layout.jointPositions.neck.y).toBeLessThan(layout.root.y);

    const torso = layout.segments.find((s) => s.id === "torso");
    expect(torso).toBeDefined();
    expect(torso!.y2).toBeLessThan(torso!.y1);
  });

  it("extends arms horizontally in T-pose", () => {
    const pose = createTPose();
    const layout = computeSkeletonLayout(pose);

    const upperArmL = layout.segments.find((s) => s.id === "upperArmL");
    const upperArmR = layout.segments.find((s) => s.id === "upperArmR");
    expect(upperArmL).toBeDefined();
    expect(upperArmR).toBeDefined();

    expect(upperArmL!.x2).toBeLessThan(upperArmL!.x1);
    expect(upperArmR!.x2).toBeGreaterThan(upperArmR!.x1);
    expect(Math.abs(upperArmL!.y2 - upperArmL!.y1)).toBeLessThan(2);
    expect(Math.abs(upperArmR!.y2 - upperArmR!.y1)).toBeLessThan(2);
  });

  it("extends legs downward in T-pose", () => {
    const pose = createTPose();
    const layout = computeSkeletonLayout(pose);

    for (const id of ["upperLegL", "upperLegR", "lowerLegL", "lowerLegR"]) {
      const seg = layout.segments.find((s) => s.id === id);
      expect(seg).toBeDefined();
      expect(seg!.y2).toBeGreaterThan(seg!.y1);
    }
  });

  it("respects segment lengths along bone direction", () => {
    const pose = createTPose();
    const layout = computeSkeletonLayout(pose);
    const torso = layout.segments.find((s) => s.id === "torso")!;

    const dx = torso.x2 - torso.x1;
    const dy = torso.y2 - torso.y1;
    const len = Math.hypot(dx, dy);
    expect(len).toBeCloseTo(DEFAULT_SEGMENT_LENGTHS.torso, 5);
  });

  it("updates child segment when a joint angle changes", () => {
    const pose = createTPose();
    pose.joints.shoulderR = 0.6;

    const layout = computeSkeletonLayout(pose);
    const tLayout = computeSkeletonLayout(createTPose());

    const armR = layout.segments.find((s) => s.id === "upperArmR")!;
    const tArmR = tLayout.segments.find((s) => s.id === "upperArmR")!;

    expect(armR.x2).not.toBeCloseTo(tArmR.x2, 1);
    expect(armR.y2).not.toBeCloseTo(tArmR.y2, 1);
  });
});

describe("worldPointToJointAngle", () => {
  it("round-trips a world direction back to the stored joint angle", () => {
    const pose = createTPose();
    pose.joints.elbowL = -0.75;
    const layout = computeSkeletonLayout(pose);

    const joint = layout.jointPositions.elbowL;
    const parentAngle = layout.jointParentAngles.elbowL;
    const worldAngle =
      parentAngle + pose.joints.elbowL + BIND_OFFSETS.elbowL;
    const tip = addPoint(joint.x, joint.y, worldAngle, 40);

    const recovered = worldPointToJointAngle(
      "elbowL",
      joint.x,
      joint.y,
      tip.x,
      tip.y,
      parentAngle,
      BIND_OFFSETS.elbowL,
    );

    expect(recovered).toBeCloseTo(pose.joints.elbowL, 5);
  });
});

describe("segmentEndPoint", () => {
  it("returns a point at the requested distance along the angle", () => {
    const end = segmentEndPoint(100, 200, 0, 50);
    expect(end.x).toBeCloseTo(150, 5);
    expect(end.y).toBeCloseTo(200, 5);
  });
});
