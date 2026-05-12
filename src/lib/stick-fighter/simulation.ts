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
const BLOCK_STUN_ATTACKER = 16;
const BLOCK_ADV_DEFENDER_FRAMES = 14;
const BLOCK_PUSHBACK = 2.75;
const KNOCKBACK_HIT = 5.5;

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
  /** Standing low stance; exclusive with blocking in input resolution. */
  crouching: boolean;
  /** edge-detect weapon cycle input */
  lastWeaponKey: boolean;
};

export type PlayerInput = {
  move: -1 | 0 | 1;
  jump: boolean;
  attack: boolean;
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

export function isGrounded(fighter: Fighter) {
  return fighter.y >= FLOOR - 1;
}

export function isBlocking(fighter: Fighter, holdBlock: boolean) {
  return holdBlock && isGrounded(fighter);
}

export function attackHitbox(f: Fighter) {
  const W = WEAPONS[f.weapon];
  if (f.atkFrame <= 0) return null;
  if (f.atkFrame > W.hitHigh || f.atkFrame < W.hitLow) return null;
  const w = W.boxW;
  const h = W.boxH;
  const x = f.facing === 1 ? f.x + W.reach : f.x - W.reach - w;
  return { x, y: f.y - 62, w, h };
}

export function hurtbox(fighter: Fighter) {
  if (fighter.crouching) {
    return { x: fighter.x - 18, y: fighter.y - 44, w: 36, h: 44 };
  }
  return { x: fighter.x - 18, y: fighter.y - 72, w: 36, h: 72 };
}

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/** Lead arm reaches farther during active hit frames. */
export function attackArmMultiplier(f: Fighter) {
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
) {
  fighter.crouching =
    Boolean(input.crouch) &&
    isGrounded(fighter) &&
    fighter.atkFrame === 0 &&
    !blocking;

  cycleWeaponEdge(fighter, input.cycleWeapon, !blocking && !frozen);

  const moveSpeed = !blocking ? MOVE_SPEED : MOVE_WHILE_BLOCKING;
  fighter.vx = 0;

  if (!frozen && !fighter.crouching && input.move !== 0) {
    fighter.vx = input.move * moveSpeed;
  }

  if (
    !blocking &&
    !frozen &&
    !fighter.crouching &&
    input.jump &&
    isGrounded(fighter)
  ) {
    fighter.vy = JUMP_V;
  }

  if (
    !frozen &&
    !blocking &&
    !fighter.crouching &&
    fighter.atkFrame === 0 &&
    input.attack &&
    fighter.atkCd === 0
  ) {
    const W = WEAPONS[fighter.weapon];
    fighter.atkFrame = W.atkDur;
    fighter.atkLanded = false;
    fighter.atkCd = W.cooldown;
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

  const adv = fighter.frameAdv > 0 ? 2 : 1;
  if (fighter.atkCd > 0) {
    fighter.atkCd -= adv;
    if (fighter.atkCd < 0) fighter.atkCd = 0;
  }

  if (fighter.blockStun > 0) fighter.blockStun--;
  if (fighter.frameAdv > 0) fighter.frameAdv--;
  if (fighter.hitFlash > 0) fighter.hitFlash--;
  if (fighter.blockFlash > 0) fighter.blockFlash--;
  if (fighter.advFlash > 0) fighter.advFlash--;
}

function resolveAttack(
  attacker: Fighter,
  defender: Fighter,
  defenderBlocking: boolean,
) {
  const hitbox = attackHitbox(attacker);
  if (!hitbox || attacker.atkLanded || !rectsOverlap(hitbox, hurtbox(defender))) {
    return;
  }

  attacker.atkLanded = true;

  if (defenderBlocking) {
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

  const W = WEAPONS[attacker.weapon];
  defender.hp -= W.damage;
  defender.hitFlash = 8;
  defender.vx = KNOCKBACK_HIT * attacker.facing;
  defender.vy = -3;
}

export function stepGame(state: GameState, inputs: GameInputs) {
  if (state.roundOver) return state;

  const [p1, p2] = state.fighters;
  const b1 = isBlocking(p1, inputs.p1.block);
  const b2 = isBlocking(p2, inputs.p2.block);
  const p1Frozen = p1.blockStun > 0;
  const p2Frozen = p2.blockStun > 0;

  applyPlayerInput(p1, inputs.p1, b1, p1Frozen);
  applyPlayerInput(p2, inputs.p2, b2, p2Frozen);

  integrateFighter(p1);
  integrateFighter(p2);

  resolveAttack(p1, p2, b2);
  resolveAttack(p2, p1, b1);

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
