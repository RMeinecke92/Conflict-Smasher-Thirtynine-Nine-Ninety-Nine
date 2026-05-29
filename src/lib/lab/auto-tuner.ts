import { FLOOR_Y, SEGMENT } from "@/lib/lab/constants";
import type { BalanceParams } from "@/lib/lab/runtime-tuning";
import { setBalanceParams } from "@/lib/lab/runtime-tuning";

export const TRIAL_DURATION_MS = 10_000;

export type TrialSample = {
  headY: number;
  footY: number;
  torsoTiltDeg: number;
  kneeBendDeg: number;
};

export type TrialReport = {
  trialIndex: number;
  avgHeadY: number;
  headYStd: number;
  minHeadY: number;
  maxHeadY: number;
  avgKneeBend: number;
  offGroundPct: number;
  avgTorsoTilt: number;
  score: number;
};

export type AutoTunerState = {
  enabled: boolean;
  trialStartedAt: number;
  trialIndex: number;
  samples: TrialSample[];
  lastReport: TrialReport | null;
  lastNotes: string[];
  targetHeadY: number;
};

export function computeTargetHeadY(): number {
  const { TORSO_H, HEAD_R, UPPER_LIMB_H, LOWER_LIMB_H, FOOT_H } = SEGMENT;
  const legSpan = UPPER_LIMB_H + LOWER_LIMB_H + FOOT_H;
  const torsoCenterY = FLOOR_Y - legSpan - TORSO_H * 0.45;
  return torsoCenterY - TORSO_H * 0.5 - HEAD_R;
}

export function createAutoTunerState(
  now: number,
  enabled = true,
): AutoTunerState {
  return {
    enabled,
    trialStartedAt: now,
    trialIndex: 0,
    samples: [],
    lastReport: null,
    lastNotes: [],
    targetHeadY: computeTargetHeadY(),
  };
}

export function recordTrialSample(
  state: AutoTunerState,
  sample: TrialSample,
): AutoTunerState {
  if (!state.enabled) return state;
  return {
    ...state,
    samples: [...state.samples, sample],
  };
}

export function trialElapsedMs(state: AutoTunerState, now: number): number {
  return now - state.trialStartedAt;
}

export function trialRemainingMs(state: AutoTunerState, now: number): number {
  return Math.max(0, TRIAL_DURATION_MS - trialElapsedMs(state, now));
}

export function isTrialComplete(state: AutoTunerState, now: number): boolean {
  return state.enabled && trialElapsedMs(state, now) >= TRIAL_DURATION_MS;
}

function summarizeTrial(
  state: AutoTunerState,
  trialIndex: number,
): TrialReport {
  const samples = state.samples;
  const n = samples.length || 1;
  const headYs = samples.map((s) => s.headY);
  const avgHeadY = headYs.reduce((a, b) => a + b, 0) / n;
  const headYStd = Math.sqrt(
    headYs.reduce((sum, y) => sum + (y - avgHeadY) ** 2, 0) / n,
  );
  const minHeadY = headYs.length ? Math.min(...headYs) : avgHeadY;
  const maxHeadY = headYs.length ? Math.max(...headYs) : avgHeadY;
  const avgKneeBend =
    samples.reduce((sum, s) => sum + s.kneeBendDeg, 0) / n;
  const avgTorsoTilt =
    samples.reduce((sum, s) => sum + s.torsoTiltDeg, 0) / n;
  const offGroundCount = samples.filter(
    (s) => s.footY < FLOOR_Y - 18,
  ).length;
  const offGroundPct = offGroundCount / n;

  const headError = Math.abs(avgHeadY - state.targetHeadY);
  const score =
    headError +
    headYStd * 0.5 +
    offGroundPct * 120 +
    Math.max(0, avgTorsoTilt - 8) * 1.5 +
    Math.max(0, 45 - avgKneeBend) * 0.4 +
    Math.max(0, avgKneeBend - 55) * 0.8;

  return {
    trialIndex,
    avgHeadY,
    headYStd,
    minHeadY,
    maxHeadY,
    avgKneeBend,
    offGroundPct,
    avgTorsoTilt,
    score,
  };
}

export function suggestAdjustments(
  report: TrialReport,
  params: BalanceParams,
  targetHeadY: number,
): { params: Partial<BalanceParams>; notes: string[] } {
  const patch: Partial<BalanceParams> = {};
  const notes: string[] = [];

  const headHigh = report.avgHeadY < targetHeadY - 20;
  const headLow = report.avgHeadY > targetHeadY + 20;
  const lifted = report.maxHeadY < targetHeadY - 35 || report.offGroundPct > 0.04;
  const collapsed = report.minHeadY > targetHeadY + 35;
  const kneesLocked = report.avgKneeBend < 10;
  const kneesBuckled = report.avgKneeBend > 50;
  const torsoWobbly = report.avgTorsoTilt > 18;
  const unstable = report.headYStd > 18;

  if (lifted) {
    patch.maxVerticalSpeed = params.maxVerticalSpeed * 0.85;
    patch.clickImpulse = params.clickImpulse * 0.88;
    patch.legStraightenTorque = params.legStraightenTorque * 0.92;
    notes.push("feet left ground → less vertical speed & click impulse");
  }

  if (headHigh && !lifted) {
    patch.torsoUprightTorque = params.torsoUprightTorque * 0.96;
    notes.push("head too high → slightly less torso torque");
  }

  if (headLow || collapsed) {
    patch.legStraightenTorque = params.legStraightenTorque + 0.025;
    patch.legExtensionStrength = params.legExtensionStrength + 0.12;
    patch.hipSupportStrength = params.hipSupportStrength + 0.1;
    patch.torsoUprightTorque = params.torsoUprightTorque + 0.015;
    notes.push("head too low → stronger leg extension & hip support");
  }

  if (kneesLocked) {
    patch.legStraightenTorque = params.legStraightenTorque - 0.035;
    patch.legStraightenDamping = params.legStraightenDamping - 0.006;
    patch.limbDamping = params.limbDamping - 0.003;
    notes.push("legs too stiff → loosen leg straightening");
  }

  if (kneesBuckled) {
    patch.legStraightenTorque = params.legStraightenTorque + 0.03;
    notes.push("knees buckled → stronger upper-leg hold");
  }

  if (torsoWobbly) {
    patch.torsoUprightTorque = params.torsoUprightTorque + 0.02;
    patch.torsoUprightDamping = params.torsoUprightDamping + 0.004;
    notes.push("torso wobble → more torso PD");
  }

  if (unstable) {
    patch.torsoUprightDamping = (patch.torsoUprightDamping ?? params.torsoUprightDamping) + 0.003;
    patch.limbDamping = params.limbDamping + 0.002;
    notes.push("head bobble → more damping");
  }

  if (notes.length === 0) {
    notes.push("within target band — holding params");
  }

  return { params: patch, notes };
}

export function completeTrial(
  state: AutoTunerState,
  params: BalanceParams,
  now: number,
): {
  state: AutoTunerState;
  report: TrialReport;
  params: BalanceParams;
} {
  const report = summarizeTrial(state, state.trialIndex);
  const { params: patch, notes } = suggestAdjustments(
    report,
    params,
    state.targetHeadY,
  );
  const nextParams = setBalanceParams(patch);

  return {
    state: {
      ...state,
      trialStartedAt: now,
      trialIndex: state.trialIndex + 1,
      samples: [],
      lastReport: report,
      lastNotes: notes,
    },
    report,
    params: nextParams,
  };
}

export function toggleAutoTuner(
  state: AutoTunerState,
  enabled: boolean,
  now: number,
): AutoTunerState {
  return {
    ...createAutoTunerState(now, enabled),
    trialIndex: state.trialIndex,
    lastReport: state.lastReport,
    lastNotes: enabled ? ["auto-tune resumed"] : ["auto-tune paused"],
  };
}
