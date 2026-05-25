"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  computeCpuInput,
  createInitialCpuState,
  type CpuDifficulty,
  type CpuState,
} from "@/lib/stick-fighter/cpu";
import {
  AIR_ATK_DUR,
  AIR_ATK_HIT_HIGH,
  AIR_ATK_HIT_LOW,
  HIGH_ATK_DUR,
  HIGH_ATK_HIT_HIGH,
  HIGH_ATK_HIT_LOW,
  LOW_ATK_DUR,
  LOW_ATK_HIT_HIGH,
  LOW_ATK_HIT_LOW,
  UPPERCUT_DUR,
  UPPERCUT_HIT_HIGH,
  UPPERCUT_HIT_LOW,
  attackArmMultiplier,
  createInitialGameState,
  type BlockHeight,
  FLOOR,
  getBlockHeight,
  MAX_HP,
  TICK_MS,
  type Fighter,
  type GameInputs,
  type GameState,
  type PlayerInput,
  isBlocking,
  isGrounded,
  stepGame,
  VIEW_H,
  VIEW_W,
  WEAPONS,
} from "@/lib/stick-fighter/simulation";

const MAX_STEPS_PER_FRAME = 5;

/** Deterministic [0, 1); stable across platforms for fixed inputs. */
function det01(n: number, salt: number): number {
  let v = Math.imul(n ^ salt, 0x9e3779b1) >>> 0;
  v ^= v << 13;
  v ^= v >>> 17;
  v ^= v << 5;
  return (v >>> 0) / 0x1_0000_0000;
}

const MOUNTAIN_STEP = 18;

function buildSilhouettePath(
  baseY: number,
  amp: number,
  baseH: number,
  salt: number,
): Path2D {
  const pth = new Path2D();
  pth.moveTo(0, VIEW_H);
  pth.lineTo(0, baseY);
  for (let x = 0; x <= VIEW_W + MOUNTAIN_STEP; x += MOUNTAIN_STEP) {
    const k = (x / MOUNTAIN_STEP) | 0;
    const dip = det01(k, salt) * amp;
    pth.lineTo(x, baseY - baseH - dip);
  }
  pth.lineTo(VIEW_W + 40, VIEW_H);
  pth.closePath();
  return pth;
}

let cachedPathSilFar: Path2D | null = null;
let cachedPathSilMid: Path2D | null = null;

function silhouettePaths(): [Path2D, Path2D] {
  if (!cachedPathSilFar || !cachedPathSilMid) {
    cachedPathSilFar = buildSilhouettePath(238, 72, 48, 0x5eed_0001);
    cachedPathSilMid = buildSilhouettePath(272, 48, 30, 0x9abc_0002);
  }
  return [cachedPathSilFar, cachedPathSilMid];
}

const SCUFFS: ReadonlyArray<{
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}> = (() => {
  const out: { x0: number; y0: number; x1: number; y1: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const x = 28 + det01(i, 0x700d) * (VIEW_W - 56);
    const y = FLOOR + 4.5 + det01(i, 0x90ad) * 2.5;
    const len = 3 + det01(i, 0xabba) * 5.5;
    const ang = (det01(i, 0x600d) - 0.5) * 0.95;
    out.push({
      x0: x,
      y0: y,
      x1: x + Math.cos(ang) * len,
      y1: y + Math.sin(ang) * len * 0.22,
    });
  }
  return out;
})();

let cachedSkyGrad: CanvasGradient | null = null;
let cachedHazeGrad: CanvasGradient | null = null;
let cachedHazeHorizGrad: CanvasGradient | null = null;
let cachedVignetteGrad: CanvasGradient | null = null;

function skyGradientFor(ctx: CanvasRenderingContext2D): CanvasGradient {
  if (!cachedSkyGrad) {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, "#0b1220");
    g.addColorStop(0.52, "#3b2a4a");
    g.addColorStop(1, "#6b4a5a");
    cachedSkyGrad = g;
  }
  return cachedSkyGrad;
}

function hazeGradientFor(ctx: CanvasRenderingContext2D): CanvasGradient {
  if (!cachedHazeGrad) {
    const g = ctx.createLinearGradient(0, FLOOR - 92, 0, FLOOR + 8);
    g.addColorStop(0, "rgba(110, 88, 120, 0)");
    g.addColorStop(0.55, "rgba(82, 66, 96, 0.28)");
    g.addColorStop(1, "rgba(58, 48, 68, 0.48)");
    cachedHazeGrad = g;
  }
  return cachedHazeGrad;
}

function hazeHorizGradientFor(ctx: CanvasRenderingContext2D): CanvasGradient {
  if (!cachedHazeHorizGrad) {
    const g = ctx.createLinearGradient(0, 0, VIEW_W, 0);
    g.addColorStop(0, "rgba(55, 45, 68, 0.34)");
    g.addColorStop(0.48, "rgba(95, 80, 108, 0.06)");
    g.addColorStop(1, "rgba(55, 45, 68, 0.34)");
    cachedHazeHorizGrad = g;
  }
  return cachedHazeHorizGrad;
}

function vignetteGradientFor(ctx: CanvasRenderingContext2D): CanvasGradient {
  if (!cachedVignetteGrad) {
    const g = ctx.createRadialGradient(
      VIEW_W * 0.5,
      VIEW_H * 0.42,
      VIEW_W * 0.18,
      VIEW_W * 0.5,
      VIEW_H * 0.48,
      VIEW_W * 0.78,
    );
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(5,4,8,0.52)");
    cachedVignetteGrad = g;
  }
  return cachedVignetteGrad;
}

function drawBackground(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = skyGradientFor(ctx);
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const [pathFar, pathMid] = silhouettePaths();

  ctx.fillStyle = "#362944";
  ctx.fill(pathFar);

  ctx.fillStyle = "#1e1828";
  ctx.fill(pathMid);

  ctx.save();
  ctx.translate(Math.sin(time * 0.014) * 6, 0);
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = hazeGradientFor(ctx);
  ctx.fillRect(-24, FLOOR - 98, VIEW_W + 48, 102);
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = hazeHorizGradientFor(ctx);
  ctx.fillRect(-24, FLOOR - 90, VIEW_W + 48, 78);
  ctx.restore();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#0d1016";
  ctx.fillRect(0, FLOOR + 6, VIEW_W, VIEW_H - (FLOOR + 6));

  ctx.strokeStyle = "rgba(200,190,210,0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, FLOOR + 6);
  ctx.lineTo(VIEW_W, FLOOR + 6);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0,0,0,0.32)";
  ctx.lineWidth = 1;
  for (const s of SCUFFS) {
    ctx.beginPath();
    ctx.moveTo(s.x0, s.y0);
    ctx.lineTo(s.x1, s.y1);
    ctx.stroke();
  }
}

function drawForegroundVignette(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = vignetteGradientFor(ctx);
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

type LandAnim = {
  wasAirborne: [boolean, boolean];
  landSquash: [number, number];
};

function updateLandAnim(fighters: [Fighter, Fighter], anim: LandAnim) {
  for (let i = 0; i < 2; i++) {
    const f = fighters[i];
    const grounded = isGrounded(f);
    if (grounded && anim.wasAirborne[i]) {
      anim.landSquash[i] = 4;
    }
    anim.wasAirborne[i] = !grounded;
  }
}

function afterDrawDecrementLandSquash(anim: LandAnim) {
  for (let i = 0; i < 2; i++) {
    if (anim.landSquash[i] > 0) anim.landSquash[i] -= 1;
  }
}

function drawStick(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  fighterColor: string,
  time: number,
  fighterIndex: 0 | 1,
  landAnim: LandAnim,
  playerInput: PlayerInput,
) {
  const W = WEAPONS[f.weapon];
  const grounded = isGrounded(f);
  const cx = f.x;
  const footY = f.y;
  const blocking = isBlocking(f, playerInput);
  const committingAttack = f.atkFrame > 0 && f.attackType !== null;
  const showBlockPose = blocking && !committingAttack;
  const blockPoseHeight: BlockHeight = showBlockPose
    ? (getBlockHeight(f, playerInput) ?? "neutral")
    : null;

  const aerialAtk = committingAttack && f.attackType === "aerial";
  const lowAtk = committingAttack && f.attackType === "low";
  const neutralAtk = committingAttack && f.attackType === "neutral";
  const highAtk = committingAttack && f.attackType === "high";
  const uppercutAtk = committingAttack && f.attackType === "uppercut";
  const invuln = f.invincibleFrames > 0;

  const crouchHold = grounded && f.crouching && !blocking;

  const breath =
    grounded &&
    !crouchHold &&
    !committingAttack &&
    Math.abs(f.vx) <= 0.5 &&
    f.atkFrame === 0
      ? Math.sin(time * 0.05 + f.x * 0.1) * 1.5
      : 0;

  const walking =
    grounded &&
    Math.abs(f.vx) > 0.5 &&
    !blocking &&
    f.atkFrame === 0 &&
    !f.crouching &&
    !committingAttack;
  const leg0 = Math.sin(time * 0.25);
  const leg1 = Math.sin(time * 0.25 + Math.PI);
  const liftL = walking ? Math.max(0, leg0) * 5 : 0;
  const liftR = walking ? Math.max(0, leg1) * 5 : 0;
  const strideSpread = walking ? leg0 * 4 * f.facing : 0;

  let sweepLean = 0;
  let lowSwingDrop = 0;
  if (lowAtk) {
    const dur = LOW_ATK_DUR;
    const hi = LOW_ATK_HIT_HIGH;
    const lo = LOW_ATK_HIT_LOW;
    if (f.atkFrame > hi) {
      const windupLen = Math.max(1, dur - hi);
      const wt = (f.atkFrame - hi) / windupLen;
      sweepLean = -f.facing * 10 * wt;
      lowSwingDrop = 26 * wt;
    } else if (f.atkFrame >= lo) {
      sweepLean = f.facing * 22;
      lowSwingDrop = 26 + Math.sin(time * 0.6) * 0.5;
    } else {
      const denom = Math.max(1, lo - 1);
      sweepLean = f.facing * 22 * (f.atkFrame / denom);
      lowSwingDrop = 26 * (f.atkFrame / denom);
    }
  }

  let attackLean = 0;
  if (!blocking && neutralAtk && f.atkFrame > 0) {
    const dur = W.atkDur;
    const hi = W.hitHigh;
    const lo = W.hitLow;
    if (f.atkFrame > hi) {
      const windupLen = Math.max(1, dur - hi);
      const wt = (f.atkFrame - hi) / windupLen;
      attackLean = -f.facing * 8 * wt;
    } else if (f.atkFrame >= lo) {
      attackLean = f.facing * 16;
    } else {
      const denom = Math.max(1, lo - 1);
      attackLean = f.facing * 16 * (f.atkFrame / denom);
    }
  }

  let highLean = 0;
  let highLift = 0;
  if (!blocking && highAtk && f.atkFrame > 0) {
    const dur = HIGH_ATK_DUR;
    const hi = HIGH_ATK_HIT_HIGH;
    const lo = HIGH_ATK_HIT_LOW;
    if (f.atkFrame > hi) {
      const windupLen = Math.max(1, dur - hi);
      const wt = (f.atkFrame - hi) / windupLen;
      highLean = -f.facing * 12 * wt;
      highLift = 6 * wt;
    } else if (f.atkFrame >= lo) {
      highLean = f.facing * 14;
      highLift = 8;
    } else {
      const denom = Math.max(1, lo - 1);
      highLean = f.facing * 14 * (f.atkFrame / denom);
      highLift = 8 * (f.atkFrame / denom);
    }
  }

  let upLean = 0;
  let upLift = 0;
  if (!blocking && uppercutAtk && f.atkFrame > 0) {
    const dur = UPPERCUT_DUR;
    const hi = UPPERCUT_HIT_HIGH;
    const lo = UPPERCUT_HIT_LOW;
    if (f.atkFrame > hi) {
      const windupLen = Math.max(1, dur - hi);
      const wt = (f.atkFrame - hi) / windupLen;
      upLean = -f.facing * 8 * wt;
      upLift = -4 * wt;
    } else if (f.atkFrame >= lo) {
      upLean = f.facing * 6;
      upLift = 12;
    } else {
      const denom = Math.max(1, lo - 1);
      upLean = f.facing * 6 * (f.atkFrame / denom);
      upLift = 12 * (f.atkFrame / denom);
    }
  }

  /** Forward torso tilt (~17°) for diving strike pose. */
  let diveTiltRad = 0;
  if (aerialAtk) {
    if (f.atkFrame > AIR_ATK_HIT_HIGH) {
      const windupLen = Math.max(1, AIR_ATK_DUR - AIR_ATK_HIT_HIGH);
      const wt = (f.atkFrame - AIR_ATK_HIT_HIGH) / windupLen;
      diveTiltRad = (0.12 + (1 - wt) * 0.18) * f.facing;
    } else if (f.atkFrame >= AIR_ATK_HIT_LOW) {
      diveTiltRad = 0.29 * f.facing;
    } else {
      const denom = Math.max(1, AIR_ATK_HIT_LOW - 1);
      diveTiltRad = 0.29 * f.facing * (f.atkFrame / denom);
    }
  }

  const leanX = attackLean + sweepLean + highLean + upLean;
  const hitT = f.hitFlash > 0 ? f.hitFlash / 8 : 0;
  const spineTilt = -f.facing * 0.11 * hitT;
  const headLagX = -f.facing * 7 * hitT;

  let torsoSy = 1;
  let torsoSx = 1;
  if (
    !grounded &&
    f.atkFrame === 0 &&
    !blocking &&
    !aerialAtk &&
    !highAtk &&
    !uppercutAtk
  ) {
    if (f.vy < -0.35) {
      torsoSy = 1.07;
      torsoSx = 0.93;
    } else if (f.vy > 0.35) {
      torsoSy = 0.93;
      torsoSx = 1.06;
    }
  }
  const sq = landAnim.landSquash[fighterIndex];
  if (sq > 0) {
    const k = sq * 0.25;
    torsoSy *= 1 - 0.11 * k;
    torsoSx *= 1 + 0.09 * k;
  }

  let headRx = 11;
  let headRy = 11;
  if (
    !grounded &&
    f.atkFrame === 0 &&
    !blocking &&
    !aerialAtk &&
    !highAtk &&
    !uppercutAtk
  ) {
    if (f.vy < -0.35) {
      headRx = 9.5;
      headRy = 12.2;
    } else if (f.vy > 0.35) {
      headRx = 11.8;
      headRy = 9.8;
    }
  }

  const tuck = showBlockPose && blockPoseHeight === "neutral" ? 3 : 0;
  const cd = crouchHold ? 1 : 0;
  /** Low-blocking stance lowers the body like crouch without setting fighter.crouching. */
  const depth = Math.max(
    cd,
    showBlockPose && blockPoseHeight === "low" ? 1 : 0,
  );
  const headLiftBlk = 0;
  const headDrop = 22 * depth + lowSwingDrop;
  const shoulderDrop = 17 * depth;
  const hipDrop = 13 * depth;
  const atkLift = highLift + upLift;
  const headY =
    footY -
    78 -
    atkLift +
    breath * (1 - depth) * 0.95 +
    headDrop -
    tuck * 0.6 +
    headLiftBlk;
  const headForward = aerialAtk
    ? f.facing * 7
    : highAtk
      ? f.facing * 5
      : sweepLean * -0.08;
  const headX = cx + leanX * 0.14 + headLagX + headForward;
  const shoulderY =
    footY -
    58 -
    atkLift * 0.85 +
    breath * (1 - depth) * 0.88 +
    shoulderDrop -
    tuck * 0.5 +
    lowSwingDrop * 0.35;
  const hipY =
    footY - 30 + breath * (1 - depth) * 0.55 + hipDrop + lowSwingDrop * 0.5;

  const offArmSwing =
    walking ? -leg1 * 6 * (f.vx >= 0 ? 1 : -1) * f.facing : 0;

  ctx.save();
  const pivotY =
    footY - 36 + depth * 10 + (lowAtk ? lowSwingDrop * 0.4 : 0) - atkLift * 0.5;
  ctx.translate(cx, pivotY);
  ctx.rotate(spineTilt + diveTiltRad);
  ctx.scale(torsoSx, torsoSy);
  ctx.translate(-cx, -pivotY);

  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const baseStroke = invuln ? "rgba(252,252,255,0.9)" : fighterColor;
  ctx.strokeStyle =
    blocking && !committingAttack ? `${baseStroke}cc` : baseStroke;

  ctx.beginPath();
  ctx.ellipse(headX, headY, headRx, headRy, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + leanX * 0.18, headY + headRy * 0.85);
  ctx.lineTo(cx + leanX * 0.2, shoulderY + 28 - depth * 14);
  ctx.stroke();

  const shX = cx + leanX * 0.2;
  const shY = shoulderY;

  let gxArc = cx + f.facing * 20;
  let gyArc = headY + 8;
  let arcR = 20;

  if (showBlockPose && blockPoseHeight === "neutral") {
    gxArc = cx + f.facing * 20;
    gyArc = headY + 8;
    arcR = 20;
    ctx.beginPath();
    ctx.moveTo(shX - 5 * f.facing, shY - 6);
    ctx.lineTo(gxArc, gyArc);
    ctx.moveTo(shX + 5 * f.facing, shY - 6);
    ctx.lineTo(gxArc, gyArc);
    ctx.stroke();
  } else if (showBlockPose && blockPoseHeight === "low") {
    gxArc = cx + f.facing * 24;
    gyArc = hipY + 4;
    arcR = 18;
    const foreY = gyArc + 2;
    ctx.beginPath();
    ctx.moveTo(shX - 4 * f.facing, shY + 14);
    ctx.lineTo(gxArc - 10 * f.facing, foreY + 22);
    ctx.moveTo(shX + 4 * f.facing, shY + 14);
    ctx.lineTo(gxArc + 10 * f.facing, foreY + 22);
    ctx.stroke();
  } else if (highAtk) {
    const Wpn = W;
    let hx = shX;
    let hy = shY;
    if (f.atkFrame > HIGH_ATK_HIT_HIGH) {
      const windupLen = Math.max(1, HIGH_ATK_DUR - HIGH_ATK_HIT_HIGH);
      const wt = (f.atkFrame - HIGH_ATK_HIT_HIGH) / windupLen;
      const bx = shX - f.facing * 28;
      const by = shY - 28;
      const sx = shX + f.facing * 32;
      const sy = shY - 48;
      hx = bx * wt + sx * (1 - wt);
      hy = by * wt + sy * (1 - wt);
    } else if (f.atkFrame >= HIGH_ATK_HIT_LOW) {
      hx = shX + f.facing * 34;
      hy = shY - 50;
    } else {
      const denom = Math.max(1, HIGH_ATK_HIT_LOW - 1);
      const r = f.atkFrame / denom;
      hx = shX + f.facing * (34 * r + 20 * (1 - r));
      hy = shY - 50 * r + (shY - 12) * (1 - r);
    }

    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(shX - f.facing * 32, shY - 10);
    ctx.stroke();

    const dx = hx - shX;
    const dy = hy - shY;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    if (f.weapon > 0) {
      const tipExt = 44;
      const startPad = 6;
      ctx.strokeStyle = Wpn.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(shX + ux * startPad, shY + uy * startPad);
      ctx.lineTo(shX + ux * (dist + tipExt), shY + uy * (dist + tipExt));
      ctx.stroke();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = baseStroke;
    }
  } else if (uppercutAtk) {
    const Wpn = W;
    let hx = shX;
    let hy = shY;
    if (f.atkFrame > UPPERCUT_HIT_HIGH) {
      const windupLen = Math.max(1, UPPERCUT_DUR - UPPERCUT_HIT_HIGH);
      const wt = (f.atkFrame - UPPERCUT_HIT_HIGH) / windupLen;
      const bx = shX + f.facing * 6;
      const by = shY + 16;
      const sx = shX + f.facing * 18;
      const sy = shY - 62;
      hx = bx * wt + sx * (1 - wt);
      hy = by * wt + sy * (1 - wt);
    } else if (f.atkFrame >= UPPERCUT_HIT_LOW) {
      hx = shX + f.facing * 20;
      hy = shY - 64;
    } else {
      const denom = Math.max(1, UPPERCUT_HIT_LOW - 1);
      const r = f.atkFrame / denom;
      hx = shX + f.facing * (20 * r + 10 * (1 - r));
      hy = shY - 64 * r + (shY + 4) * (1 - r);
    }

    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(shX - f.facing * 26, shY + 16);
    ctx.stroke();

    const dx = hx - shX;
    const dy = hy - shY;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    if (f.weapon > 0) {
      const tipExt = 42;
      const startPad = 5;
      ctx.strokeStyle = Wpn.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(shX + ux * startPad, shY + uy * startPad);
      ctx.lineTo(shX + ux * (dist + tipExt), shY + uy * (dist + tipExt));
      ctx.stroke();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = baseStroke;
    }
  } else if (aerialAtk) {
    const Wpn = W;
    let hx = shX;
    let hy = shY;
    if (f.atkFrame > AIR_ATK_HIT_HIGH) {
      const windupLen = Math.max(1, AIR_ATK_DUR - AIR_ATK_HIT_HIGH);
      const wt = (f.atkFrame - AIR_ATK_HIT_HIGH) / windupLen;
      const bx = shX - f.facing * 26;
      const by = shY - 22;
      const sx = shX + f.facing * 52;
      const sy = shY + 42;
      hx = bx * wt + sx * (1 - wt);
      hy = by * wt + sy * (1 - wt);
    } else if (f.atkFrame >= AIR_ATK_HIT_LOW) {
      hx = shX + f.facing * 52;
      hy = shY + 42;
    } else {
      const denom = Math.max(1, AIR_ATK_HIT_LOW - 1);
      const r = f.atkFrame / denom;
      hx = shX + f.facing * (52 * r + 14 * (1 - r));
      hy = shY + 42 * r + 12 * (1 - r);
    }

    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    const tuckBackX = shX - f.facing * 21;
    const tuckBackY = shY + 3;
    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(tuckBackX, tuckBackY);
    ctx.stroke();

    const dx = hx - shX;
    const dy = hy - shY;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    if (f.weapon > 0) {
      const tipExt = 46;
      const startPad = 6;
      ctx.strokeStyle = Wpn.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(shX + ux * startPad, shY + uy * startPad);
      ctx.lineTo(shX + ux * (dist + tipExt), shY + uy * (dist + tipExt));
      ctx.stroke();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = baseStroke;
    }
  } else if (lowAtk) {
    const Wpn = W;
    let hx = shX;
    let hy = shY;
    if (f.atkFrame > LOW_ATK_HIT_HIGH) {
      const windupLen = Math.max(1, LOW_ATK_DUR - LOW_ATK_HIT_HIGH);
      const wt = (f.atkFrame - LOW_ATK_HIT_HIGH) / windupLen;
      const bx = shX - f.facing * 18;
      const by = shY - 40;
      const sx = shX + f.facing * 64;
      const sy = shY + 40;
      hx = bx * wt + sx * (1 - wt);
      hy = by * wt + sy * (1 - wt);
    } else if (f.atkFrame >= LOW_ATK_HIT_LOW) {
      hx = shX + f.facing * 66;
      hy = shY + 42;
    } else {
      const denom = Math.max(1, LOW_ATK_HIT_LOW - 1);
      const r = f.atkFrame / denom;
      hx = shX + f.facing * (66 * r + 18 * (1 - r));
      hy = shY + 42 * r + 10 * (1 - r);
    }

    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(shX - f.facing * 28, shY + 22);
    ctx.stroke();

    const dx = hx - shX;
    const dy = hy - shY;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    if (f.weapon > 0) {
      const tipExt = 40;
      const startPad = 5;
      ctx.strokeStyle = Wpn.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(shX + ux * startPad, shY + uy * startPad);
      ctx.lineTo(shX + ux * (dist + tipExt), shY + uy * (dist + tipExt));
      ctx.stroke();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = baseStroke;
    }
  } else {
    const Wpn = W;
    let shoulderAngle = 0;
    if (neutralAtk && f.atkFrame > 0) {
      if (f.atkFrame > Wpn.hitHigh) {
        const windupLen = Math.max(1, Wpn.atkDur - Wpn.hitHigh);
        const wt = (f.atkFrame - Wpn.hitHigh) / windupLen;
        shoulderAngle = -f.facing * (0.78 * wt);
      } else if (f.atkFrame >= Wpn.hitLow) {
        shoulderAngle = f.facing * 0.05;
      } else {
        const denom = Math.max(1, Wpn.hitLow - 1);
        shoulderAngle = f.facing * 0.05 * (f.atkFrame / denom);
      }
    }

    const armExt =
      (12 + Wpn.reach * 2.8) * attackArmMultiplier(f);
    const reachX = shX + f.facing * armExt * Math.cos(shoulderAngle);
    const reachY = shY - 6 + breath * 0.28 + Math.sin(shoulderAngle) * armExt * 0.35;

    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(reachX, reachY);
    ctx.stroke();

    const backArmX = shX - f.facing * 18 + leanX * 0.28 + offArmSwing;
    ctx.beginPath();
    ctx.moveTo(shX, shY);
    ctx.lineTo(backArmX, shoulderY + 14 + breath * 0.18);
    ctx.stroke();

    if (f.weapon > 0 && neutralAtk && f.atkFrame > 0) {
      let wAng = 0;
      if (f.atkFrame > Wpn.hitHigh) {
        const windupLen = Math.max(1, Wpn.atkDur - Wpn.hitHigh);
        const wt = (f.atkFrame - Wpn.hitHigh) / windupLen;
        wAng = -f.facing * (0.95 - wt * 0.45);
      } else if (f.atkFrame >= Wpn.hitLow) {
        wAng = -f.facing * 0.06;
      } else {
        wAng =
          -f.facing * 0.06 * (f.atkFrame / Math.max(1, Wpn.hitLow - 1));
      }

      const span = armExt + 38;
      ctx.strokeStyle = Wpn.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const wx0 = shX + f.facing * 6 + leanX * 0.08;
      const wy0 = shoulderY - 5 + breath * 0.15;
      ctx.moveTo(wx0, wy0);
      ctx.lineTo(
        wx0 + Math.cos(wAng) * span * f.facing,
        wy0 + Math.sin(wAng) * span * 0.35,
      );
      ctx.stroke();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = baseStroke;
    }
  }

  ctx.beginPath();
  ctx.moveTo(shX, shY);
  ctx.lineTo(shX, hipY);
  ctx.stroke();

  if (!showBlockPose) {
    if (highAtk || uppercutAtk) {
      const toe = highAtk ? 4 : 5;
      const lfX = cx - 11 * f.facing;
      const rfX = cx + 11 * f.facing;
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(lfX, footY - toe);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(rfX, footY - toe);
      ctx.stroke();
    } else if (aerialAtk) {
      const tuckX = cx - f.facing * 7;
      const tuckY = hipY + 26;
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(tuckX - f.facing * 16, hipY + 12);
      ctx.lineTo(tuckX + f.facing * 3, tuckY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(tuckX + f.facing * 16, hipY + 12);
      ctx.lineTo(tuckX - f.facing * 3, tuckY);
      ctx.stroke();
    } else if (lowAtk) {
      const backFootX = cx - f.facing * 38;
      const frontFootX = cx + f.facing * 16;
      const kneeFrontY = footY - 34;
      const kneeBackY = footY - 18;
      ctx.beginPath();
      ctx.moveTo(shX, hipY + 10);
      ctx.lineTo(cx + f.facing * 8, kneeFrontY);
      ctx.lineTo(frontFootX, footY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shX, hipY + 10);
      ctx.lineTo(backFootX, kneeBackY);
      ctx.lineTo(backFootX - f.facing * 4, footY);
      ctx.stroke();
    } else if (crouchHold) {
      const kneeY = footY - 24;
      const footXL = cx - 19 * f.facing;
      const footXR = cx + 19 * f.facing;
      const kneeXL = cx - 30 * f.facing;
      const kneeXR = cx + 30 * f.facing;
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(kneeXL, kneeY);
      ctx.lineTo(footXL, footY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(kneeXR, kneeY);
      ctx.lineTo(footXR, footY);
      ctx.stroke();
    } else {
      const lfX = cx - 10 * f.facing - strideSpread;
      const rfX = cx + 10 * f.facing + strideSpread;
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(lfX, footY - liftL);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(rfX, footY - liftR);
      ctx.stroke();
    }
  } else {
    if (showBlockPose && blockPoseHeight === "low") {
      const kneeY = footY - 24;
      const footXL = cx - 19 * f.facing;
      const footXR = cx + 19 * f.facing;
      const kneeXL = cx - 30 * f.facing;
      const kneeXR = cx + 30 * f.facing;
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(kneeXL, kneeY);
      ctx.lineTo(footXL, footY - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(kneeXR, kneeY);
      ctx.lineTo(footXR, footY - 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(cx - 10 * f.facing + leanX * 0.12, footY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shX, hipY);
      ctx.lineTo(cx + 10 * f.facing + leanX * 0.12, footY);
      ctx.stroke();
    }

    const pulse =
      f.blockFlash > 0 ? 0.4 * Math.sin(time * 0.38) : 0;
    ctx.strokeStyle = `rgba(248,250,252,${0.48 + pulse})`;
    ctx.lineWidth =
      2.8 +
      (f.blockFlash > 0
        ? 1.1 + Math.sin(time * 0.42) * 0.35
        : 0);

    ctx.beginPath();
    const arcYOffset = blockPoseHeight === "low" ? 8 : -2;
    ctx.arc(
      gxArc - f.facing * 3,
      gyArc + arcYOffset,
      arcR,
      Math.PI * 0.9,
      Math.PI * 2.32,
    );
    ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle =
      blocking && !committingAttack ? `${baseStroke}cc` : baseStroke;
  }

  ctx.restore();

  if (showBlockPose && f.blockFlash > 0) {
    ctx.fillStyle = "rgba(147,197,253,0.42)";
    ctx.beginPath();
    ctx.arc(cx, headY - 2, 24, 0, Math.PI * 2);
    ctx.fill();
  } else if (invuln) {
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.arc(cx, headY - 4, 32, 0, Math.PI * 2);
    ctx.fill();
  } else if (!showBlockPose && (f.hitFlash > 0 || f.advFlash > 0)) {
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.beginPath();
    ctx.arc(cx, headY - 2, 24, 0, Math.PI * 2);
    ctx.fill();
  }
}

type HudState = {
  p1: number;
  p2: number;
  wp1: string;
  wp2: string;
  msg: string;
};

const INITIAL_HUD: HudState = {
  p1: MAX_HP,
  p2: MAX_HP,
  wp1: WEAPONS[0].name,
  wp2: WEAPONS[0].name,
  msg: "",
};

function movementInput(
  keys: Set<string>,
  negativeKey: string,
  positiveKey: string,
): PlayerInput["move"] {
  if (keys.has(negativeKey)) return -1;
  if (keys.has(positiveKey)) return 1;
  return 0;
}

function snapshotInputs(keys: Set<string>): GameInputs {
  return {
    p1: {
      move: movementInput(keys, "a", "d"),
      jump: keys.has("w") || keys.has("space"),
      attack: keys.has("f"),
      uppercut: keys.has("r"),
      block: keys.has("g"),
      crouch: keys.has("s"),
      cycleWeapon: keys.has("q"),
    },
    p2: {
      move: movementInput(keys, "arrowleft", "arrowright"),
      jump: keys.has("arrowup"),
      attack: keys.has("k"),
      uppercut: keys.has(";"),
      block: keys.has("l"),
      crouch: keys.has("arrowdown"),
      cycleWeapon: keys.has("p"),
    },
  };
}

function hudFromState(state: GameState): HudState {
  const [p1, p2] = state.fighters;
  return {
    p1: p1.hp,
    p2: p2.hp,
    wp1: WEAPONS[p1.weapon].name,
    wp2: WEAPONS[p2.weapon].name,
    msg: state.message,
  };
}

export function StickFighterGame() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const gameRef = useRef<GameState>(createInitialGameState());
  const accumulatorRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const roundOverRef = useRef(false);
  const lastHudRef = useRef<HudState>(INITIAL_HUD);
  const landAnimRef = useRef<LandAnim>({
    wasAirborne: [false, false],
    landSquash: [0, 0],
  });
  const cpuStateRef = useRef<CpuState>(createInitialCpuState());
  const vsCpuRef = useRef(true);
  const cpuDifficultyRef = useRef<CpuDifficulty>("normal");
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [roundOver, setRoundOver] = useState(false);
  const [vsCpu, setVsCpu] = useState(true);
  const [cpuDifficulty, setCpuDifficulty] = useState<CpuDifficulty>("normal");

  useEffect(() => {
    vsCpuRef.current = vsCpu;
  }, [vsCpu]);

  useEffect(() => {
    cpuDifficultyRef.current = cpuDifficulty;
  }, [cpuDifficulty]);

  const mergeCpuInput = useCallback(
    (game: GameState, inputs: GameInputs): GameInputs => {
      if (!vsCpuRef.current) return inputs;
      const cpuResult = computeCpuInput(
        game,
        1,
        cpuDifficultyRef.current,
        cpuStateRef.current,
      );
      cpuStateRef.current = cpuResult.nextState;
      return { p1: inputs.p1, p2: cpuResult.input };
    },
    [],
  );

  const syncHudFromGame = useCallback((state: GameState) => {
    const nextHud = hudFromState(state);
    const lastHud = lastHudRef.current;

    if (
      lastHud.p1 !== nextHud.p1 ||
      lastHud.p2 !== nextHud.p2 ||
      lastHud.wp1 !== nextHud.wp1 ||
      lastHud.wp2 !== nextHud.wp2 ||
      lastHud.msg !== nextHud.msg
    ) {
      lastHudRef.current = nextHud;
      setHud(nextHud);
    }

    if (roundOverRef.current !== state.roundOver) {
      roundOverRef.current = state.roundOver;
      setRoundOver(state.roundOver);
    }
  }, []);

  const resetRound = useCallback(() => {
    const nextState = createInitialGameState();
    const nextHud = hudFromState(nextState);

    gameRef.current = nextState;
    accumulatorRef.current = 0;
    lastFrameTimeRef.current = null;
    roundOverRef.current = false;
    lastHudRef.current = nextHud;
    landAnimRef.current = {
      wasAirborne: [false, false],
      landSquash: [0, 0],
    };
    cpuStateRef.current = createInitialCpuState();
    setRoundOver(false);
    setHud(nextHud);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const landLocal = landAnimRef.current;

    const trackedKeys = [
      "a",
      "d",
      "w",
      "f",
      "r",
      "s",
      "g",
      "q",
      ";",
      "arrowleft",
      "arrowright",
      "arrowup",
      "arrowdown",
      "k",
      "l",
      "p",
    ];

    const onKey = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      const code = e.code;
      if (trackedKeys.includes(k) || code === "Space" || k === ";") {
        e.preventDefault();
      }
      if (code === "Space" || code === "Enter") {
        if (down && roundOverRef.current) {
          resetRound();
          keysRef.current.delete("space");
          return;
        }
        if (code === "Space") {
          if (down) keysRef.current.add("space");
          else keysRef.current.delete("space");
        }
        return;
      }
      if (down) keysRef.current.add(k);
      else keysRef.current.delete(k);
    };

    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    let raf = 0;
    const step = (now: number) => {
      const game = gameRef.current;
      const t = timeRef.current++;

      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = now;
      }

      let inputsForDraw = mergeCpuInput(
        game,
        snapshotInputs(keysRef.current),
      );

      if (!game.roundOver) {
        const elapsed = now - lastFrameTimeRef.current;
        lastFrameTimeRef.current = now;
        accumulatorRef.current += Math.min(
          elapsed,
          TICK_MS * MAX_STEPS_PER_FRAME,
        );

        let steps = 0;
        while (
          accumulatorRef.current >= TICK_MS &&
          steps < MAX_STEPS_PER_FRAME &&
          !game.roundOver
        ) {
          inputsForDraw = mergeCpuInput(
            game,
            snapshotInputs(keysRef.current),
          );
          stepGame(game, inputsForDraw);
          accumulatorRef.current -= TICK_MS;
          steps += 1;
        }

        syncHudFromGame(game);
      }

      updateLandAnim(game.fighters, landLocal);

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = wrap.getBoundingClientRect();
      const cssW = Math.min(VIEW_W, rect.width);
      const cssH = (cssW / VIEW_W) * VIEW_H;
      if (
        canvas.width !== Math.floor(cssW * dpr) ||
        canvas.height !== Math.floor(cssH * dpr)
      ) {
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);
        canvas.style.width = `${cssW}px`;
        canvas.style.height = `${cssH}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      const scale = cssW / VIEW_W;
      ctx.save();
      ctx.scale(scale, scale);

      drawBackground(ctx, t);

      const [a, b] = game.fighters;
      drawStick(ctx, a, "#38bdf8", t, 0, landLocal, inputsForDraw.p1);
      drawStick(ctx, b, "#f87171", t, 1, landLocal, inputsForDraw.p2);

      drawForegroundVignette(ctx);

      ctx.restore();

      afterDrawDecrementLandSquash(landLocal);

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [mergeCpuInput, resetRound, syncHudFromGame]);

  const setPlayer2Cpu = useCallback(
    (enabled: boolean) => {
      setVsCpu(enabled);
      resetRound();
    },
    [resetRound],
  );

  const setDifficulty = useCallback(
    (difficulty: CpuDifficulty) => {
      setCpuDifficulty(difficulty);
      resetRound();
    },
    [resetRound],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Player 2:
          </span>
          <Button
            type="button"
            size="sm"
            variant={vsCpu ? "default" : "outline"}
            onClick={() => setPlayer2Cpu(true)}
          >
            CPU
          </Button>
          <Button
            type="button"
            size="sm"
            variant={vsCpu ? "outline" : "default"}
            onClick={() => setPlayer2Cpu(false)}
          >
            Human
          </Button>
        </div>
        {vsCpu && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Difficulty:
            </span>
            {(["easy", "normal", "hard"] as const).map((level) => (
              <Button
                key={level}
                type="button"
                size="sm"
                variant={cpuDifficulty === level ? "default" : "outline"}
                onClick={() => setDifficulty(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
        Five attacks, two blocks. HIGH ATTACK (W+F / ↑+K): swings overhead —
        beats neutral block, whiffs over low block. NEUTRAL ATTACK (F / K):
        chest-level poke — beats no blocks but applies blockstun. LOW ATTACK
        (S+F / ↓+K): sweep — beats neutral block, blocked by low block. AERIAL
        (F while airborne / K while airborne): descending crush — beats both
        blocks but commits to a jump. UPPERCUT (S+R / ↓+;): rising anti-air
        with brief invincibility — punishes aerials, blocked by all grounded
        blocks. Block neutral (G / L): chest guard. Block low (S+G / ↓+L):
        floor guard, also dodges high and neutral attacks.
      </p>
      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        tabIndex={0}
        role="application"
        aria-label="Stick fighter game canvas, click to focus for keyboard"
      >
        <canvas
          ref={canvasRef}
          className="mx-auto block touch-none"
          width={VIEW_W}
          height={VIEW_H}
        />
        {roundOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
            <p className="font-heading text-xl font-semibold text-foreground">
              {hud.msg}
            </p>
            <p className="text-sm text-muted-foreground">
              Press Space or Enter to play again
            </p>
          </div>
        )}
      </div>
      <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2 sm:text-sm">
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
          <p className="font-medium text-sky-600 dark:text-sky-400">Blue</p>
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            Weapon:{" "}
            <span className="font-medium text-foreground">{hud.wp1}</span>
          </p>
          <p>
            Move{" "}
            <kbd className="rounded border bg-background px-1">A</kbd> /{" "}
            <kbd className="rounded border bg-background px-1">D</kbd>
            {" · "}
            Jump <kbd className="rounded border bg-background px-1">W</kbd> or
            Space · Neutral{" "}
            <kbd className="rounded border bg-background px-1">F</kbd> · Low{" "}
            <kbd className="rounded border bg-background px-1">S</kbd>+
            <kbd className="rounded border bg-background px-1">F</kbd> · High{" "}
            <kbd className="rounded border bg-background px-1">W</kbd>+
            <kbd className="rounded border bg-background px-1">F</kbd> ·
            Uppercut{" "}
            <kbd className="rounded border bg-background px-1">S</kbd>+
            <kbd className="rounded border bg-background px-1">R</kbd> · Block{" "}
            <kbd className="rounded border bg-background px-1">G</kbd> · Block
            low{" "}
            <kbd className="rounded border bg-background px-1">S</kbd>+
            <kbd className="rounded border bg-background px-1">G</kbd> · Crouch{" "}
            <kbd className="rounded border bg-background px-1">S</kbd> · Weapon{" "}
            <kbd className="rounded border bg-background px-1">Q</kbd>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full bg-sky-500 transition-[width] duration-150"
              style={{ width: `${(hud.p1 / MAX_HP) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
          <p className="font-medium text-red-500 dark:text-red-400">Red</p>
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            Weapon:{" "}
            <span className="font-medium text-foreground">{hud.wp2}</span>
          </p>
          {vsCpu ? (
            <p className="text-[11px] text-muted-foreground sm:text-xs">
              CPU controls this fighter
            </p>
          ) : (
            <p>
              Move{" "}
              <kbd className="rounded border bg-background px-1">←</kbd> / {" "}
              <kbd className="rounded border bg-background px-1">→</kbd> · Jump{" "}
              <kbd className="rounded border bg-background px-1">↑</kbd> ·
              Neutral{" "}
              <kbd className="rounded border bg-background px-1">K</kbd> · Low{" "}
              <kbd className="rounded border bg-background px-1">↓</kbd>+
              <kbd className="rounded border bg-background px-1">K</kbd> · High{" "}
              <kbd className="rounded border bg-background px-1">↑</kbd>+
              <kbd className="rounded border bg-background px-1">K</kbd> ·
              Uppercut{" "}
              <kbd className="rounded border bg-background px-1">↓</kbd>+{" "}
              <kbd className="rounded border bg-background px-1">;</kbd> · Block{" "}
              <kbd className="rounded border bg-background px-1">L</kbd> · Block
              low{" "}
              <kbd className="rounded border bg-background px-1">↓</kbd>+
              <kbd className="rounded border bg-background px-1">L</kbd> ·
              Crouch{" "}
              <kbd className="rounded border bg-background px-1">↓</kbd> ·
              Weapon{" "}
              <kbd className="rounded border bg-background px-1">P</kbd>
            </p>
          )}
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full bg-red-500 transition-[width] duration-150"
              style={{ width: `${(hud.p2 / MAX_HP) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
