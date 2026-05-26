export const VIEW_W = 720;
export const VIEW_H = 380;
export const FLOOR = VIEW_H - 44;
export const TICK_RATE = 60;
export const TICK_MS = 1000 / TICK_RATE;
export const MAX_HP = 100;

const GRAVITY = 0.62;
const MOVE_SPEED = 4.4;
const MOVE_WHILE_BLOCKING = 1.4;
const JUMP_V = -11.5;
export const BLOCK_STUN_ATTACKER = 16;
export const BLOCK_ADV_DEFENDER_FRAMES = 14;
export const BLOCK_PUSHBACK = 2.75;
const KNOCKBACK_HIT = 5.5;

// ─── High attack (overhead) ────────────────────────────────────
export const HIGH_ATK_DUR = 14;
export const HIGH_ATK_HIT_HIGH = 11;
export const HIGH_ATK_HIT_LOW = 4;
export const HIGH_ATK_DAMAGE = 12;
export const HIGH_ATK_COOLDOWN = 30;
export const HIGH_ATK_REACH = 12;
export const HIGH_ATK_BOX_W = 60;
export const HIGH_ATK_BOX_H = 24;
export const HIGH_ATK_KNOCKBACK = 4.5;

// ─── Aerial attack ─────────────────────────────────────────────
export const AIR_ATK_DUR = 12;
export const AIR_ATK_HIT_HIGH = 10;
export const AIR_ATK_HIT_LOW = 4;
export const AIR_ATK_DAMAGE = 13;
export const AIR_ATK_COOLDOWN = 32;
export const AIR_ATK_REACH = 8;
export const AIR_ATK_BOX_W = 54;
export const AIR_ATK_BOX_H = 40;
export const AIR_ATK_KNOCKBACK = 4.0;

// ─── Low attack (sweep) ────────────────────────────────────────
export const LOW_ATK_DUR = 18;
export const LOW_ATK_HIT_HIGH = 14;
export const LOW_ATK_HIT_LOW = 6;
export const LOW_ATK_DAMAGE = 10;
export const LOW_ATK_COOLDOWN = 34;
export const LOW_ATK_REACH = 14;
export const LOW_ATK_BOX_W = 68;
export const LOW_ATK_BOX_H = 22;
export const LOW_ATK_KNOCKBACK = 3.5;

// ─── Uppercut (anti-air) ───────────────────────────────────────
export const UPPERCUT_DUR = 16;
export const UPPERCUT_HIT_HIGH = 12;
export const UPPERCUT_HIT_LOW = 5;
export const UPPERCUT_DAMAGE = 20;
export const UPPERCUT_COOLDOWN = 50;
export const UPPERCUT_REACH = 10;
export const UPPERCUT_BOX_W = 38;
export const UPPERCUT_BOX_H = 110;
export const UPPERCUT_KNOCKBACK = 6.0;
export const UPPERCUT_INVINCIBLE_FRAMES = 6;

export const WEAPONS = [
  {
    name: "Fists",
    damage: 9,
    atkDur: 14,
    cooldown: 26,
    hitHigh: 11,
    hitLow: 4,
    boxW: 46,
    boxH: 28,
    reach: 10,
    color: "#94a3b8",
  },
  {
    name: "Baton",
    damage: 12,
    atkDur: 16,
    cooldown: 34,
    hitHigh: 12,
    hitLow: 5,
    boxW: 62,
    boxH: 30,
    reach: 14,
    color: "#c4b5fd",
  },
  {
    name: "Spear",
    damage: 15,
    atkDur: 18,
    cooldown: 44,
    hitHigh: 13,
    hitLow: 5,
    boxW: 86,
    boxH: 22,
    reach: 20,
    color: "#fde047",
  },
] as const;

export type AttackType = "high" | "neutral" | "low" | "aerial" | "uppercut";
export type BlockHeight = "neutral" | "low" | null;

export type Box = { x: number; y: number; w: number; h: number };

export type Fighter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  weapon: number;
  atkFrame: number;
  atkCd: number;
  hitFlash: number;
  atkLanded: boolean;
  blockStun: number;
  frameAdv: number;
  blockFlash: number;
  advFlash: number;
  /** Passive crouch (S / ↓ only; never while attacking or blocking). */
  crouching: boolean;
  /** edge-detect weapon cycle input */
  lastWeaponKey: boolean;
  attackType: AttackType | null;
  jumpPressedAt: number;
  crouchPressedAt: number;
  jumpWasHeld: boolean;
  crouchWasHeld: boolean;
  jumpPressedRecently: number;
  invincibleFrames: number;
};

export type PlayerInput = {
  move: -1 | 0 | 1;
  jump: boolean;
  attack: boolean;
  /** R / ; — only fires uppercut when crouch is the active stance modifier. */
  uppercut: boolean;
  block: boolean;
  crouch: boolean;
  cycleWeapon: boolean;
};

export type GameInputs = {
  p1: PlayerInput;
  p2: PlayerInput;
};

export type GameState = {
  fighters: [Fighter, Fighter];
  tick: number;
  roundOver: boolean;
  message: string;
};

export function makeFighter(x: number, facing: 1 | -1): Fighter {
  return {
    x,
    y: FLOOR,
    vx: 0,
    vy: 0,
    facing,
    hp: MAX_HP,
    weapon: 0,
    atkFrame: 0,
    atkCd: 0,
    hitFlash: 0,
    atkLanded: false,
    blockStun: 0,
    frameAdv: 0,
    blockFlash: 0,
    advFlash: 0,
    crouching: false,
    lastWeaponKey: false,
    attackType: null,
    jumpPressedAt: 0,
    crouchPressedAt: 0,
    jumpWasHeld: false,
    crouchWasHeld: false,
    jumpPressedRecently: 0,
    invincibleFrames: 0,
  };
}

export function createInitialGameState(): GameState {
  return {
    fighters: [
      makeFighter(VIEW_W * 0.28, 1),
      makeFighter(VIEW_W * 0.72, -1),
    ],
    tick: 0,
    roundOver: false,
    message: "",
  };
}

export function createNextRoundState(previous: GameState): GameState {
  const next = createInitialGameState();
  next.fighters[0].weapon = previous.fighters[0].weapon;
  next.fighters[1].weapon = previous.fighters[1].weapon;
  return next;
}

export function isGrounded(fighter: Fighter) {
  return fighter.y >= FLOOR - 1;
}

export function activeStanceModifier(
  fighter: Fighter,
  input: PlayerInput,
): "jump" | "crouch" | null {
  if (input.jump && input.crouch) {
    return fighter.crouchPressedAt > fighter.jumpPressedAt ? "crouch" : "jump";
  }
  if (input.jump) return "jump";
  if (input.crouch) return "crouch";
  return null;
}

export function isBlockingLow(fighter: Fighter, input: PlayerInput): boolean {
  return (
    input.block &&
    isGrounded(fighter) &&
    activeStanceModifier(fighter, input) === "crouch"
  );
}

export function getBlockHeight(
  fighter: Fighter,
  input: PlayerInput,
): BlockHeight {
  if (!input.block) return null;
  if (!isGrounded(fighter)) return null;
  if (isBlockingLow(fighter, input)) return "low";
  return "neutral";
}

export function isBlocking(fighter: Fighter, input: PlayerInput): boolean {
  return getBlockHeight(fighter, input) !== null;
}

export function guardZone(
  fighter: Fighter,
  input: PlayerInput,
): Box | null {
  if (!isBlocking(fighter, input)) return null;
  if (isBlockingLow(fighter, input)) {
    return { x: fighter.x - 22, y: fighter.y - 30, w: 44, h: 30 };
  }
  return { x: fighter.x - 22, y: fighter.y - 72, w: 44, h: 50 };
}

export function hurtbox(fighter: Fighter, input: PlayerInput): Box {
  if (fighter.crouching || isBlockingLow(fighter, input)) {
    return { x: fighter.x - 18, y: fighter.y - 36, w: 36, h: 36 };
  }
  return { x: fighter.x - 18, y: fighter.y - 72, w: 36, h: 72 };
}

export function attackHitbox(f: Fighter) {
  if (f.atkFrame <= 0 || f.attackType === null) return null;

  const t = f.attackType;

  if (t === "aerial") {
    if (f.atkFrame > AIR_ATK_HIT_HIGH || f.atkFrame < AIR_ATK_HIT_LOW) {
      return null;
    }
    const w = AIR_ATK_BOX_W;
    const h = AIR_ATK_BOX_H;
    const x =
      f.facing === 1 ? f.x + AIR_ATK_REACH : f.x - AIR_ATK_REACH - w;
    return { x, y: f.y, w, h };
  }

  if (t === "low") {
    if (f.atkFrame > LOW_ATK_HIT_HIGH || f.atkFrame < LOW_ATK_HIT_LOW) {
      return null;
    }
    const w = LOW_ATK_BOX_W;
    const h = LOW_ATK_BOX_H;
    const x =
      f.facing === 1 ? f.x + LOW_ATK_REACH : f.x - LOW_ATK_REACH - w;
    return { x, y: f.y - 18, w, h };
  }

  if (t === "high") {
    if (f.atkFrame > HIGH_ATK_HIT_HIGH || f.atkFrame < HIGH_ATK_HIT_LOW) {
      return null;
    }
    const w = HIGH_ATK_BOX_W;
    const h = HIGH_ATK_BOX_H;
    const x =
      f.facing === 1 ? f.x + HIGH_ATK_REACH : f.x - HIGH_ATK_REACH - w;
    return { x, y: f.y - 92, w, h };
  }

  if (t === "uppercut") {
    if (f.atkFrame > UPPERCUT_HIT_HIGH || f.atkFrame < UPPERCUT_HIT_LOW) {
      return null;
    }
    const w = UPPERCUT_BOX_W;
    const h = UPPERCUT_BOX_H;
    const x =
      f.facing === 1 ? f.x + UPPERCUT_REACH : f.x - UPPERCUT_REACH - w;
    return { x, y: f.y - 100, w, h };
  }

  const W = WEAPONS[f.weapon];
  if (f.atkFrame > W.hitHigh || f.atkFrame < W.hitLow) return null;
  const w = W.boxW;
  const h = W.boxH;
  const x = f.facing === 1 ? f.x + W.reach : f.x - W.reach - w;
  return { x, y: f.y - 62, w, h };
}

function rectsOverlap(a: Box, b: Box) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function damageForAttack(attacker: Fighter): number {
  switch (attacker.attackType) {
    case "aerial":
      return AIR_ATK_DAMAGE;
    case "low":
      return LOW_ATK_DAMAGE;
    case "high":
      return HIGH_ATK_DAMAGE;
    case "uppercut":
      return UPPERCUT_DAMAGE;
    case "neutral":
    default:
      return WEAPONS[attacker.weapon].damage;
  }
}

function knockbackForAttack(attacker: Fighter): number {
  switch (attacker.attackType) {
    case "aerial":
      return AIR_ATK_KNOCKBACK;
    case "low":
      return LOW_ATK_KNOCKBACK;
    case "high":
      return HIGH_ATK_KNOCKBACK;
    case "uppercut":
      return UPPERCUT_KNOCKBACK;
    case "neutral":
    default:
      return KNOCKBACK_HIT;
  }
}

/** Lead arm reaches farther during active hit frames. */
export function attackArmMultiplier(f: Fighter) {
  const t = f.attackType;
  if (t === "aerial") {
    const inHit =
      f.atkFrame > 0 &&
      f.atkFrame <= AIR_ATK_HIT_HIGH &&
      f.atkFrame >= AIR_ATK_HIT_LOW;
    return inHit ? 1 : 0.4;
  }
  if (t === "low") {
    const inHit =
      f.atkFrame > 0 &&
      f.atkFrame <= LOW_ATK_HIT_HIGH &&
      f.atkFrame >= LOW_ATK_HIT_LOW;
    return inHit ? 1 : 0.4;
  }
  if (t === "high") {
    const inHit =
      f.atkFrame > 0 &&
      f.atkFrame <= HIGH_ATK_HIT_HIGH &&
      f.atkFrame >= HIGH_ATK_HIT_LOW;
    return inHit ? 1 : 0.4;
  }
  if (t === "uppercut") {
    const inHit =
      f.atkFrame > 0 &&
      f.atkFrame <= UPPERCUT_HIT_HIGH &&
      f.atkFrame >= UPPERCUT_HIT_LOW;
    return inHit ? 1 : 0.4;
  }
  const W = WEAPONS[f.weapon];
  const inHit =
    f.atkFrame > 0 && f.atkFrame <= W.hitHigh && f.atkFrame >= W.hitLow;
  return inHit ? 1 : 0.4;
}

/** Try weapon cycle on rising edge. */
function cycleWeaponEdge(
  fighter: Fighter,
  keyDown: boolean,
  armed: boolean,
) {
  if (!armed || fighter.atkFrame > 0 || fighter.atkCd > 0) {
    fighter.lastWeaponKey = keyDown;
    return;
  }
  if (keyDown && !fighter.lastWeaponKey) {
    fighter.weapon = (fighter.weapon + 1) % WEAPONS.length;
  }
  fighter.lastWeaponKey = keyDown;
}

function applyPlayerInput(
  fighter: Fighter,
  input: PlayerInput,
  blocking: boolean,
  frozen: boolean,
  tick: number,
) {
  if (input.jump) {
    if (!fighter.jumpWasHeld) fighter.jumpPressedAt = tick;
  } else {
    fighter.jumpPressedAt = 0;
  }
  fighter.jumpWasHeld = input.jump;

  if (input.crouch) {
    if (!fighter.crouchWasHeld) fighter.crouchPressedAt = tick;
  } else {
    fighter.crouchPressedAt = 0;
  }
  fighter.crouchWasHeld = input.crouch;

  const mod = activeStanceModifier(fighter, input);
  const grounded = isGrounded(fighter);

  fighter.crouching =
    grounded &&
    fighter.atkFrame === 0 &&
    !blocking &&
    mod === "crouch" &&
    !input.attack &&
    !input.uppercut &&
    !input.block;

  cycleWeaponEdge(fighter, input.cycleWeapon, !blocking && !frozen);

  const moveSpeed = !blocking ? MOVE_SPEED : MOVE_WHILE_BLOCKING;
  fighter.vx = 0;

  if (
    !frozen &&
    (!fighter.crouching || blocking) &&
    input.move !== 0
  ) {
    fighter.vx = input.move * moveSpeed;
  }

  const canStartAttack =
    !frozen && !blocking && fighter.atkFrame === 0 && fighter.atkCd === 0;

  const skipJumpForHigh =
    canStartAttack &&
    input.attack &&
    mod === "jump" &&
    grounded;

  if (!blocking && !frozen && mod === "jump" && grounded && !skipJumpForHigh) {
    fighter.vy = JUMP_V;
    fighter.jumpPressedRecently = 5;
  }

  if (
    canStartAttack &&
    input.uppercut &&
    mod === "crouch" &&
    grounded
  ) {
    fighter.atkFrame = UPPERCUT_DUR;
    fighter.atkCd = UPPERCUT_COOLDOWN;
    fighter.attackType = "uppercut";
    fighter.atkLanded = false;
    fighter.invincibleFrames = UPPERCUT_INVINCIBLE_FRAMES;
  } else if (canStartAttack && input.attack) {
    if (!grounded) {
      fighter.atkFrame = AIR_ATK_DUR;
      fighter.atkCd = AIR_ATK_COOLDOWN;
      fighter.attackType = "aerial";
      fighter.atkLanded = false;
    } else if (mod === "crouch") {
      fighter.atkFrame = LOW_ATK_DUR;
      fighter.atkCd = LOW_ATK_COOLDOWN;
      fighter.attackType = "low";
      fighter.atkLanded = false;
    } else if (
      mod === "jump" ||
      (fighter.jumpPressedRecently > 0 && fighter.y > FLOOR - 20)
    ) {
      fighter.vy = 0;
      fighter.y = FLOOR;
      fighter.jumpPressedRecently = 0;
      fighter.atkFrame = HIGH_ATK_DUR;
      fighter.atkCd = HIGH_ATK_COOLDOWN;
      fighter.attackType = "high";
      fighter.atkLanded = false;
    } else {
      const W = WEAPONS[fighter.weapon];
      fighter.atkFrame = W.atkDur;
      fighter.atkCd = W.cooldown;
      fighter.attackType = "neutral";
      fighter.atkLanded = false;
    }
  }
}

function integrateFighter(fighter: Fighter) {
  fighter.x += fighter.vx;
  fighter.y += fighter.vy;
  fighter.vy += GRAVITY;

  if (fighter.y > FLOOR) {
    fighter.y = FLOOR;
    fighter.vy = 0;
  }

  fighter.x = Math.max(32, Math.min(VIEW_W - 32, fighter.x));
  if (fighter.atkFrame > 0) fighter.atkFrame--;
  if (fighter.atkFrame === 0) fighter.attackType = null;

  const adv = fighter.frameAdv > 0 ? 2 : 1;
  if (fighter.atkCd > 0) {
    fighter.atkCd -= adv;
    if (fighter.atkCd < 0) fighter.atkCd = 0;
  }

  if (fighter.jumpPressedRecently > 0) fighter.jumpPressedRecently--;
  if (fighter.invincibleFrames > 0) fighter.invincibleFrames--;

  if (fighter.blockStun > 0) fighter.blockStun--;
  if (fighter.frameAdv > 0) fighter.frameAdv--;
  if (fighter.hitFlash > 0) fighter.hitFlash--;
  if (fighter.blockFlash > 0) fighter.blockFlash--;
  if (fighter.advFlash > 0) fighter.advFlash--;
}

function resolveAttack(
  attacker: Fighter,
  defender: Fighter,
  defenderInput: PlayerInput,
) {
  const hitbox = attackHitbox(attacker);
  if (!hitbox || attacker.atkLanded) return;

  if (defender.invincibleFrames > 0) return;

  const defenderHurtbox = hurtbox(defender, defenderInput);
  const defenderGuard = guardZone(defender, defenderInput);

  const hitsGuard = defenderGuard !== null && rectsOverlap(hitbox, defenderGuard);
  const hitsBody = rectsOverlap(hitbox, defenderHurtbox);

  if (!hitsGuard && !hitsBody) return;

  attacker.atkLanded = true;

  const aerialOverridesBlock =
    attacker.attackType === "aerial" && isGrounded(defender);

  if (hitsGuard && !aerialOverridesBlock) {
    defender.blockFlash = 10;
    defender.frameAdv = Math.max(
      defender.frameAdv,
      BLOCK_ADV_DEFENDER_FRAMES,
    );
    defender.advFlash = 18;
    attacker.blockStun = Math.max(attacker.blockStun, BLOCK_STUN_ATTACKER);
    attacker.x -= BLOCK_PUSHBACK * attacker.facing;
    defender.x += BLOCK_PUSHBACK * attacker.facing;
    return;
  }

  const damage = damageForAttack(attacker);
  const knockback = knockbackForAttack(attacker);
  defender.hp -= damage;
  defender.hitFlash = 8;
  defender.vx = knockback * attacker.facing;
  defender.vy = -3;
}

export function stepGame(state: GameState, inputs: GameInputs) {
  if (state.roundOver) return state;

  const [p1, p2] = state.fighters;
  const tick = state.tick;
  const b1Height = getBlockHeight(p1, inputs.p1);
  const b2Height = getBlockHeight(p2, inputs.p2);
  const b1 = b1Height !== null;
  const b2 = b2Height !== null;
  const p1Frozen = p1.blockStun > 0;
  const p2Frozen = p2.blockStun > 0;

  applyPlayerInput(p1, inputs.p1, b1, p1Frozen, tick);
  applyPlayerInput(p2, inputs.p2, b2, p2Frozen, tick);

  integrateFighter(p1);
  integrateFighter(p2);

  resolveAttack(p1, p2, inputs.p2);
  resolveAttack(p2, p1, inputs.p1);

  if (p1.atkFrame === 0) {
    p1.facing = p2.x >= p1.x ? 1 : -1;
  }
  if (p2.atkFrame === 0) {
    p2.facing = p1.x >= p2.x ? 1 : -1;
  }

  if (p1.hp <= 0 || p2.hp <= 0) {
    state.roundOver = true;
    state.message = p1.hp <= 0 ? "Red wins!" : "Blue wins!";
    p1.hp = Math.max(0, p1.hp);
    p2.hp = Math.max(0, p2.hp);
  }

  state.tick += 1;
  return state;
}
