"use client";

import { Label } from "@/components/ui/label";

import { JOINT_ANGLE_LIMITS, JOINT_KEYS, JOINT_LABELS } from "./constants";
import type { JointKey, PoseJSON } from "./types";
import { radiansToDegrees } from "./utils";

type SliderPanelProps = {
  pose: PoseJSON;
  activeJoint: JointKey | null;
  onJointAngleChange: (joint: JointKey, angle: number) => void;
  onActiveJointChange: (joint: JointKey | null) => void;
};

export function SliderPanel({
  pose,
  activeJoint,
  onJointAngleChange,
  onActiveJointChange,
}: SliderPanelProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-200">Joint angles</h2>
      <p className="text-xs text-slate-400">
        Sliders and canvas drag stay in sync. Values shown in degrees; stored
        internally in radians.
      </p>
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {JOINT_KEYS.map((joint) => {
          const limits = JOINT_ANGLE_LIMITS[joint];
          const value = pose.joints[joint];
          const isActive = activeJoint === joint;

          return (
            <div
              key={joint}
              className={`rounded-md border p-2 ${
                isActive
                  ? "border-amber-400/60 bg-amber-400/5"
                  : "border-slate-700 bg-slate-900/40"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <Label
                  htmlFor={`joint-${joint}`}
                  className="text-xs text-slate-300"
                >
                  {JOINT_LABELS[joint]}
                </Label>
                <span className="font-mono text-xs text-amber-300">
                  {radiansToDegrees(value).toFixed(1)}°
                </span>
              </div>
              <input
                id={`joint-${joint}`}
                type="range"
                min={limits.min}
                max={limits.max}
                step={0.01}
                value={value}
                onFocus={() => onActiveJointChange(joint)}
                onChange={(event) =>
                  onJointAngleChange(joint, Number(event.target.value))
                }
                className="w-full accent-amber-400"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
