import { describe, expect, it } from "vitest";

import { computeSkeletonLayout } from "./kinematics";
import knightLongGuard from "./knight_longGuard.json";
import { mirrorPose } from "./mirror";
import { parsePoseJson, poseToJsonString } from "./pose-io";
import { createTPose } from "./tpose";
import type { PoseJSON } from "./types";

describe("mirrorPose", () => {
  it("swaps left and right joint values with negation", () => {
    const pose: PoseJSON = {
      ...createTPose("guard"),
      joints: {
        waist: 0.2,
        neck: -0.1,
        shoulderL: -0.3,
        shoulderR: 0.5,
        elbowL: -0.8,
        elbowR: -1.0,
        hipL: 0.15,
        hipR: -0.05,
        kneeL: 0.25,
        kneeR: 0.1,
      },
    };

    const mirrored = mirrorPose(pose);
    expect(mirrored.joints.shoulderL).toBeCloseTo(-0.5, 5);
    expect(mirrored.joints.shoulderR).toBeCloseTo(0.3, 5);
    expect(mirrored.joints.elbowL).toBeCloseTo(1.0, 5);
    expect(mirrored.joints.elbowR).toBeCloseTo(0.8, 5);
    expect(mirrored.joints.hipL).toBeCloseTo(0.05, 5);
    expect(mirrored.joints.hipR).toBeCloseTo(-0.15, 5);
    expect(mirrored.joints.kneeL).toBeCloseTo(-0.1, 5);
    expect(mirrored.joints.kneeR).toBeCloseTo(-0.25, 5);
    expect(mirrored.joints.waist).toBeCloseTo(-0.2, 5);
    expect(mirrored.joints.neck).toBeCloseTo(0.1, 5);
    expect(mirrored.rootRotation).toBeCloseTo(0, 5);
  });

  it("negates rootRotation", () => {
    const pose = createTPose();
    pose.rootRotation = 0.4;
    const mirrored = mirrorPose(pose);
    expect(mirrored.rootRotation).toBeCloseTo(-0.4, 5);
  });

  it("appends _mirror to the pose name", () => {
    const mirrored = mirrorPose(createTPose("knight_longGuard"));
    expect(mirrored.name).toBe("knight_longGuard_mirror");
  });

  it("double mirror restores symmetric joint layout", () => {
    const original = parsePoseJson(poseToJsonString(knightLongGuard as PoseJSON));
    const once = mirrorPose(original);
    const twice = mirrorPose(once);

    const layoutA = computeSkeletonLayout(original);
    const layoutB = computeSkeletonLayout(twice);

    for (const id of layoutA.segments.map((s) => s.id)) {
      const segA = layoutA.segments.find((s) => s.id === id)!;
      const segB = layoutB.segments.find((s) => s.id === id)!;
      expect(segB.x1).toBeCloseTo(segA.x1, 3);
      expect(segB.y1).toBeCloseTo(segA.y1, 3);
      expect(segB.x2).toBeCloseTo(segA.x2, 3);
      expect(segB.y2).toBeCloseTo(segA.y2, 3);
    }
  });
});

describe("pose JSON round-trip", () => {
  it("parses and serializes sample pose cleanly", () => {
    const parsed = parsePoseJson(JSON.stringify(knightLongGuard));
    expect(parsed.name).toBe("knight_longGuard");
    expect(parsed.character).toBe("knight");
    const again = parsePoseJson(poseToJsonString(parsed));
    expect(again).toEqual(parsed);
  });
});
