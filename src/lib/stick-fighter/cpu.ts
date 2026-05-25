import {
  isGrounded,
  type AttackType,
  type Fighter,
  type GameState,
  type PlayerInput,
  WEAPONS,
} from "@/lib/stick-fighter/simulation";

export type CpuDifficulty = "easy" | "normal" | "hard";

export type CpuMode = "approach" | "pressure" | "defend" | "retreat" | "antiair";

export type CpuState = {
  mode: CpuMode;
  reactionTimer: number;
  decisionCooldown: number;
  /** 0 = neutral, 1 = low, 2 = high */
  pressureAttack: 0 | 1 | 2;
  lastHumanAtkFrame: number;
  /** True until the CPU commits to one attack input. */
  pendingAttack: boolean;
};

type DifficultyConfig = {
  reactionMin: number;
  reactionMax: number;
  blockAccuracy: number;
  /** Ticks between attack decisions while pressuring. */
  attackCooldown: number;
  punishChance: number;
  /** Chance to actually swing when an attack window opens. */
  attackChance: number;
  /** Chance to pressure at mid range instead of closing slowly. */
  pressureChance: number;
  /** Chance to commit uppercut on an airborne approach. */
  antiairChance: number;
};

const DIST_FAR = 100;
const DIST_CLOSE = 40;
const DIST_ANTIAIR = 95;

const DIFFICULTY: Record<CpuDifficulty, DifficultyConfig> = {
  easy: {
    reactionMin: 20,
    reactionMax: 26,
    blockAccuracy: 0.5,
    attackCooldown: 78,
    punishChance: 0.06,
    attackChance: 0.38,
    pressureChance: 0.42,
    antiairChance: 0.25,
  },
  normal: {
    reactionMin: 10,
    reactionMax: 14,
    blockAccuracy: 0.8,
    attackCooldown: 28,
    punishChance: 0.5,
    attackChance: 1,
    pressureChance: 1,
    antiairChance: 0.85,
  },
  hard: {
    reactionMin: 4,
    reactionMax: 8,
    blockAccuracy: 0.95,
    attackCooldown: 18,
    punishChance: 0.75,
    attackChance: 1,
    pressureChance: 1,
    antiairChance: 1,
  },
};

const EMPTY_INPUT: PlayerInput = {
  move: 0,
  jump: false,
  attack: false,
  uppercut: false,
  block: false,
  crouch: false,
  cycleWeapon: false,
};

/** Deterministic [0, 1) for CPU decisions. */
function det01(tick: number, salt: number): number {
  let v = Math.imul(tick ^ salt, 0x9e3779b1) >>> 0;
  v ^= v << 13;
  v ^= v >>> 17;
  v ^= v << 5;
  return (v >>> 0) / 0x1_0000_0000;
}

export function createInitialCpuState(): CpuState {
  return {
    mode: "approach",
    reactionTimer: 0,
    decisionCooldown: 24,
    pressureAttack: 0,
    lastHumanAtkFrame: 0,
    pendingAttack: false,
  };
}

function horizontalDistance(a: Fighter, b: Fighter): number {
  return Math.abs(a.x - b.x);
}

function moveToward(cpu: Fighter, human: Fighter): -1 | 0 | 1 {
  const dx = human.x - cpu.x;
  if (Math.abs(dx) < 6) return 0;
  return dx > 0 ? 1 : -1;
}

function moveAway(cpu: Fighter, human: Fighter): -1 | 0 | 1 {
  const toward = moveToward(cpu, human);
  if (toward === 0) return 0;
  return (toward * -1) as -1 | 1;
}

function humanIsThreatening(human: Fighter): boolean {
  return human.atkFrame > 0;
}

function humanIsRecoveringWhiff(human: Fighter): boolean {
  if (human.atkFrame <= 0 || human.atkLanded) return false;
  const hitLow = hitLowForType(human.attackType, human.weapon);
  return human.atkFrame < hitLow;
}

function hitLowForType(type: AttackType | null, weapon: number): number {
  switch (type) {
    case "aerial":
      return 4;
    case "low":
      return 6;
    case "high":
      return 4;
    case "uppercut":
      return 5;
    case "neutral":
      return WEAPONS[weapon].hitLow;
    default:
      return 0;
  }
}

function inferBlockHeight(human: Fighter): "neutral" | "low" | "none" {
  if (human.attackType === "aerial") return "none";
  if (human.attackType === "low" || human.crouching) return "low";
  return "neutral";
}

function humanAirborneThreat(human: Fighter, cpu: Fighter): boolean {
  if (isGrounded(human)) return false;
  const dist = horizontalDistance(cpu, human);
  if (dist > DIST_ANTIAIR + 40) return false;
  const closing =
    (human.x < cpu.x && human.vx > 0.5) ||
    (human.x > cpu.x && human.vx < -0.5) ||
    dist < DIST_ANTIAIR;
  return closing && (human.vy > -1 || dist < DIST_ANTIAIR * 0.75);
}

function reactionDelay(tick: number, cfg: DifficultyConfig): number {
  const span = cfg.reactionMax - cfg.reactionMin + 1;
  return cfg.reactionMin + Math.floor(det01(tick, 0xc0_a1) * span);
}

function shouldBlockCorrectly(tick: number, cfg: DifficultyConfig): boolean {
  return det01(tick, 0xc0_b2) < cfg.blockAccuracy;
}

function shouldPunish(tick: number, cfg: DifficultyConfig): boolean {
  return det01(tick, 0xc0_c3) < cfg.punishChance;
}

function pickPressureAttack(tick: number): 0 | 1 | 2 {
  const roll = det01(tick, 0xc0_d4);
  if (roll < 0.45) return 0;
  if (roll < 0.78) return 1;
  return 2;
}

function chooseMode(
  cpu: Fighter,
  human: Fighter,
  dist: number,
  tick: number,
  cfg: DifficultyConfig,
): CpuMode {
  if (cpu.blockStun > 0 || (cpu.atkCd > 25 && cpu.atkFrame === 0)) {
    return "retreat";
  }

  if (cpu.atkFrame > 0) {
    const hitLow = hitLowForType(cpu.attackType, cpu.weapon);
    if (cpu.atkFrame < hitLow) return "retreat";
  }

  if (human.frameAdv > 10) return "retreat";

  if (humanAirborneThreat(human, cpu)) return "antiair";

  if (humanIsThreatening(human)) return "defend";

  if (
    humanIsRecoveringWhiff(human) &&
    dist < DIST_FAR &&
    shouldPunish(tick, cfg)
  ) {
    return "pressure";
  }

  if (dist > DIST_FAR) return "approach";

  if (dist > DIST_CLOSE && det01(tick, 0xc0_e5) > cfg.pressureChance) {
    return "approach";
  }

  if (dist <= DIST_CLOSE || dist <= DIST_FAR) return "pressure";

  return "approach";
}

function applyPressureInput(
  input: PlayerInput,
  cpu: Fighter,
  attack: 0 | 1 | 2,
): void {
  if (cpu.atkFrame > 0 || cpu.atkCd > 0) return;

  switch (attack) {
    case 0:
      input.attack = true;
      break;
    case 1:
      input.crouch = true;
      input.attack = true;
      break;
    case 2:
      input.jump = true;
      input.attack = true;
      break;
  }
}

function applyDefendInput(
  input: PlayerInput,
  human: Fighter,
  tick: number,
  cfg: DifficultyConfig,
  state: CpuState,
): void {
  if (state.reactionTimer > 0) return;

  const needed = inferBlockHeight(human);
  if (needed === "none") return;

  let blockHeight = needed;
  if (!shouldBlockCorrectly(tick, cfg)) {
    blockHeight = needed === "low" ? "neutral" : "low";
  }

  input.block = true;
  if (blockHeight === "low") {
    input.crouch = true;
  }
}

function applyAntiairInput(
  input: PlayerInput,
  cpu: Fighter,
  human: Fighter,
  dist: number,
  tick: number,
  cfg: DifficultyConfig,
): void {
  input.move = moveToward(cpu, human);

  if (
    dist <= DIST_ANTIAIR &&
    cpu.atkFrame === 0 &&
    cpu.atkCd === 0 &&
    isGrounded(cpu) &&
    det01(tick, 0xc0_a8) < cfg.antiairChance
  ) {
    input.crouch = true;
    input.uppercut = true;
  }
}

export function computeCpuInput(
  state: GameState,
  cpuIndex: 0 | 1,
  difficulty: CpuDifficulty,
  cpuState: CpuState,
): { input: PlayerInput; nextState: CpuState } {
  const cfg = DIFFICULTY[difficulty];
  const humanIndex = cpuIndex === 0 ? 1 : 0;
  const cpu = state.fighters[cpuIndex];
  const human = state.fighters[humanIndex];
  const tick = state.tick;
  const dist = horizontalDistance(cpu, human);

  const next: CpuState = {
    mode: cpuState.mode,
    reactionTimer: Math.max(0, cpuState.reactionTimer - 1),
    decisionCooldown: Math.max(0, cpuState.decisionCooldown - 1),
    pressureAttack: cpuState.pressureAttack,
    lastHumanAtkFrame: human.atkFrame,
    pendingAttack: cpuState.pendingAttack,
  };

  const desiredMode = chooseMode(cpu, human, dist, tick, cfg);
  next.mode = desiredMode;

  if (
    desiredMode === "defend" &&
    human.atkFrame > 0 &&
    cpuState.lastHumanAtkFrame === 0
  ) {
    next.reactionTimer = reactionDelay(tick, cfg);
  }

  if (desiredMode !== "pressure") {
    next.pendingAttack = false;
  }

  if (
    desiredMode === "pressure" &&
    next.decisionCooldown === 0 &&
    cpu.atkFrame === 0
  ) {
    next.pressureAttack = pickPressureAttack(tick);
    if (cpu.atkCd === 0 && det01(tick, 0xc0_f6) < cfg.attackChance) {
      next.pendingAttack = true;
    }
    next.decisionCooldown = cfg.attackCooldown;
  }

  const input: PlayerInput = { ...EMPTY_INPUT };

  switch (next.mode) {
    case "approach":
      input.move = moveToward(cpu, human);
      break;
    case "pressure":
      if (cpu.atkFrame === 0) {
        input.move =
          dist > DIST_CLOSE + 10
            ? moveToward(cpu, human)
            : dist < DIST_CLOSE - 8
              ? moveAway(cpu, human)
              : 0;
      }
      if (
        next.pendingAttack &&
        cpu.atkCd === 0 &&
        cpu.atkFrame === 0
      ) {
        applyPressureInput(input, cpu, next.pressureAttack);
        next.pendingAttack = false;
      }
      break;
    case "defend":
      input.move = moveAway(cpu, human);
      applyDefendInput(input, human, tick, cfg, next);
      break;
    case "retreat":
      input.move = moveAway(cpu, human);
      break;
    case "antiair":
      applyAntiairInput(input, cpu, human, dist, tick, cfg);
      break;
  }

  return { input, nextState: next };
}
