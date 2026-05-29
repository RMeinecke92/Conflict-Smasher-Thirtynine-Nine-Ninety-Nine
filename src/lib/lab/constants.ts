import { TUNING } from "@/lib/lab/tuning";

export const VIEW_W = 720;
export const VIEW_H = 380;
export const FLOOR_Y = VIEW_H - 44;

export const TICK_RATE = 60;
export const TICK_MS = 1000 / TICK_RATE;
export const MAX_STEPS_PER_FRAME = 5;

export const LINE_WIDTH = 3;
export const STROKE_COLOR = "#111111";

export const SEGMENT = {
  TORSO_W: 10,
  TORSO_H: 56,
  HEAD_R: 8,
  UPPER_LIMB_H: 28,
  LOWER_LIMB_H: 26,
  LIMB_W: 3,
  HAND_R: 3,
  FOOT_W: 22,
  FOOT_H: 4,
} as const;

export const CLICK_IMPULSE = TUNING.CLICK_IMPULSE;
