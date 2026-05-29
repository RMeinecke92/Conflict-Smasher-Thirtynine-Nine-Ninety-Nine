import { TUNING } from "@/lib/lab/tuning";

export type BalanceParams = {
  torsoUprightTorque: number;
  torsoUprightDamping: number;
  legStraightenTorque: number;
  legStraightenDamping: number;
  legExtensionStrength: number;
  hipSupportStrength: number;
  limbDamping: number;
  maxVerticalSpeed: number;
  clickImpulse: number;
};

export const BALANCE_PARAM_LIMITS = {
  torsoUprightTorque: { min: 0.12, max: 0.65 },
  torsoUprightDamping: { min: 0.02, max: 0.12 },
  legStraightenTorque: { min: 0.04, max: 0.45 },
  legStraightenDamping: { min: 0.01, max: 0.08 },
  legExtensionStrength: { min: 0.2, max: 2 },
  hipSupportStrength: { min: 0.2, max: 2 },
  limbDamping: { min: 0.005, max: 0.05 },
  maxVerticalSpeed: { min: 2, max: 8 },
  clickImpulse: { min: 0.004, max: 0.02 },
} as const;

export function createDefaultBalanceParams(): BalanceParams {
  return {
    torsoUprightTorque: TUNING.TORSO_UPRIGHT_TORQUE,
    torsoUprightDamping: TUNING.TORSO_UPRIGHT_DAMPING,
    legStraightenTorque: TUNING.LEG_STRAIGHTEN_TORQUE,
    legStraightenDamping: TUNING.LEG_STRAIGHTEN_DAMPING,
    legExtensionStrength: TUNING.LEG_EXTENSION_STRENGTH,
    hipSupportStrength: TUNING.HIP_SUPPORT_STRENGTH,
    limbDamping: TUNING.LIMB_DAMPING,
    maxVerticalSpeed: TUNING.MAX_VERTICAL_SPEED,
    clickImpulse: TUNING.CLICK_IMPULSE,
  };
}

function clampParam<K extends keyof BalanceParams>(
  key: K,
  value: number,
): number {
  const { min, max } = BALANCE_PARAM_LIMITS[key];
  return Math.min(max, Math.max(min, value));
}

let runtimeParams = createDefaultBalanceParams();

export function getBalanceParams(): BalanceParams {
  return runtimeParams;
}

export function setBalanceParams(patch: Partial<BalanceParams>): BalanceParams {
  const next = { ...runtimeParams };
  for (const key of Object.keys(patch) as (keyof BalanceParams)[]) {
    const value = patch[key];
    if (value !== undefined) {
      next[key] = clampParam(key, value) as BalanceParams[typeof key];
    }
  }
  runtimeParams = next;
  return runtimeParams;
}

export function resetBalanceParams(): BalanceParams {
  runtimeParams = createDefaultBalanceParams();
  return runtimeParams;
}

export function nudgeBalanceParam(
  key: keyof BalanceParams,
  delta: number,
): BalanceParams {
  return setBalanceParams({ [key]: runtimeParams[key] + delta });
}
