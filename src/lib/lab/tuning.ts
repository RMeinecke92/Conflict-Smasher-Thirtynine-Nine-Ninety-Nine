export const TUNING = {
  // Attack phases (frames @ 60fps)
  STAB_WINDUP: 8,
  STAB_ACTIVE: 4,
  STAB_RECOVERY: 12,
  CHOP_WINDUP: 14,
  CHOP_ACTIVE: 6,
  CHOP_RECOVERY: 18,

  // Feint
  FEINT_COOLDOWN_MS: 200,
  FEINT_STAMINA_COST: 5,

  // Stamina
  STAMINA_MAX: 100,
  STAMINA_REGEN_IDLE: 5,
  STAMINA_REGEN_STILL: 8,
  STAMINA_COST_STAB: 8,
  STAMINA_COST_CHOP: 12,
  STAMINA_COST_GUARD_PER_SEC: 2,
  STAMINA_COST_PRESS_DOWN: 15,

  // Animation speed scaling thresholds
  STAMINA_SLOW_THRESHOLD_1: 50,
  STAMINA_SLOW_THRESHOLD_2: 25,
  STAMINA_SLOW_THRESHOLD_3: 10,

  // Guard zone
  GUARD_ZONE_BUFFER_PX: 20,

  // Bind
  BIND_BASE_DURATION_FRAMES: 30,
  PRESS_DOWN_FORCE: 50,

  // Knockdown
  KNOCKDOWN_IMPULSE_THRESHOLD: 50,
  KNOCKDOWN_DURATION_MS: 1000,
  RECOVERY_DURATION_MS: 2000,

  // Movement
  WALK_FORCE: 0.002,
  WALK_FORCE_EXHAUSTED: 0.001,

  // Procedural walk cycle (stepping gait)
  WALK_STEP_LENGTH: 26, // px a foot advances per step
  WALK_STEP_TICKS: 16, // ticks one foot spends mid-swing (@60Hz ≈ 0.27s)
  WALK_STEP_LIFT: 14, // px peak foot lift at mid-swing
  WALK_SPEED: 2, // max torso x-velocity while catching up to the feet (px/tick)
  WALK_LEAD: 1.5, // px the torso leans ahead of the foot center while walking
  WALK_TRACK: 0.18, // how strongly the torso tracks toward its support base
  WALK_UPRIGHT_BOOST: 1.5, // extra torso-upright authority while walking

  // Physics character balance — defaults; auto-tuner adjusts copies in runtime-tuning.ts
  TORSO_UPRIGHT_TORQUE: 0.42,
  TORSO_UPRIGHT_DAMPING: 0.055,
  LEG_STRAIGHTEN_TORQUE: 0.24,
  LEG_STRAIGHTEN_DAMPING: 0.032,
  LEG_EXTENSION_STRENGTH: 1.4,
  HIP_SUPPORT_STRENGTH: 1.8,
  LIMB_DAMPING: 0.008,
  MAX_VERTICAL_SPEED: 4,
  CLICK_IMPULSE: 0.008,
} as const;
