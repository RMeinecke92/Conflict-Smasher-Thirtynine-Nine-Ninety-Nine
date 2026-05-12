"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  attackArmMultiplier,
  createInitialGameState,
  FLOOR,
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
  blocking: boolean,
  time: number,
  fighterIndex: 0 | 1,
  landAnim: LandAnim,
) {
  const W = WEAPONS[f.weapon];
  const grounded = isGrounded(f);
  const cx = f.x;
  const footY = f.y;
  const crouchHold = grounded && f.crouching && !blocking;

  const breath =
    grounded &&
    !crouchHold &&
    Math.abs(f.vx) <= 0.5 &&
    f.atkFrame === 0
      ? Math.sin(time * 0.05 + f.x * 0.1) * 1.5
      : 0;

  const walking =
    grounded &&
    Math.abs(f.vx) > 0.5 &&
    !blocking &&
    f.atkFrame === 0 &&
    !f.crouching;
  const leg0 = Math.sin(time * 0.25);
  const leg1 = Math.sin(time * 0.25 + Math.PI);
  const liftL = walking ? Math.max(0, leg0) * 5 : 0;
  const liftR = walking ? Math.max(0, leg1) * 5 : 0;
  const strideSpread = walking ? leg0 * 4 * f.facing : 0;

  let attackLean = 0;
  if (!blocking && f.atkFrame > 0) {
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

  const leanX = attackLean;
  const hitT = f.hitFlash > 0 ? f.hitFlash / 8 : 0;
  const spineTilt = -f.facing * 0.11 * hitT;
  const headLagX = -f.facing * 7 * hitT;

  let torsoSy = 1;
  let torsoSx = 1;
  if (!grounded && f.atkFrame === 0 && !blocking) {
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
  if (!grounded && f.atkFrame === 0 && !blocking) {
    if (f.vy < -0.35) {
      headRx = 9.5;
      headRy = 12.2;
    } else if (f.vy > 0.35) {
      headRx = 11.8;
      headRy = 9.8;
    }
  }

  const tuck = blocking ? 3 : 0;
  const cd = crouchHold ? 1 : 0;
  const headDrop = 22 * cd;
  const shoulderDrop = 17 * cd;
  const hipDrop = 13 * cd;
  const headY =
    footY - 78 + breath * (1 - cd) * 0.95 + headDrop - tuck * 0.6;
  const headX = cx + leanX * 0.14 + headLagX;
  const shoulderY =
    footY - 58 + breath * (1 - cd) * 0.88 + shoulderDrop - tuck * 0.5;
  const hipY = footY - 30 + breath * (1 - cd) * 0.55 + hipDrop;

  const offArmSwing =
    walking ? -leg1 * 6 * (f.vx >= 0 ? 1 : -1) * f.facing : 0;

  ctx.save();
  const pivotY = footY - 36 + cd * 10;
  ctx.translate(cx, pivotY);
  ctx.rotate(spineTilt);
  ctx.scale(torsoSx, torsoSy);
  ctx.translate(-cx, -pivotY);

  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = blocking ? `${fighterColor}cc` : fighterColor;

  ctx.beginPath();
  ctx.ellipse(headX, headY, headRx, headRy, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + leanX * 0.18, headY + headRy * 0.85);
  ctx.lineTo(
    cx + leanX * 0.2,
    shoulderY + 28 - cd * 14,
  );
  ctx.stroke();

  const shX = cx + leanX * 0.2;
  const shY = shoulderY;

  if (blocking) {
    const gx = cx + f.facing * 20;
    const gy = headY + 8;
    ctx.beginPath();
    ctx.moveTo(shX - 5 * f.facing, shY);
    ctx.lineTo(gx, gy);
    ctx.moveTo(shX + 5 * f.facing, shY);
    ctx.lineTo(gx, gy);
    ctx.stroke();
  } else {
    const Wpn = W;
    let shoulderAngle = 0;
    if (f.atkFrame > 0) {
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

    if (f.weapon > 0 && f.atkFrame > 0) {
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
      ctx.strokeStyle = fighterColor;
    }
  }

  ctx.beginPath();
  ctx.moveTo(shX, shY);
  ctx.lineTo(shX, hipY);
  ctx.stroke();

  if (!blocking) {
    if (crouchHold) {
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
    ctx.beginPath();
    ctx.moveTo(shX, hipY);
    ctx.lineTo(cx - 10 * f.facing + leanX * 0.12, footY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(shX, hipY);
    ctx.lineTo(cx + 10 * f.facing + leanX * 0.12, footY);
    ctx.stroke();

    const gx = cx + f.facing * 20;
    const gy = headY + 8;
    const pulse = f.blockFlash > 0 ? 0.4 * Math.sin(time * 0.38) : 0;
    ctx.strokeStyle = `rgba(248,250,252,${0.48 + pulse})`;
    ctx.lineWidth = 2.8 + (f.blockFlash > 0 ? 1.1 + Math.sin(time * 0.42) * 0.35 : 0);
    ctx.beginPath();
    ctx.arc(
      gx - f.facing * 3,
      gy - 2,
      20,
      Math.PI * 0.9,
      Math.PI * 2.32,
    );
    ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = blocking ? `${fighterColor}cc` : fighterColor;
  }

  ctx.restore();

  if (blocking && f.blockFlash > 0) {
    ctx.fillStyle = "rgba(147,197,253,0.42)";
    ctx.beginPath();
    ctx.arc(cx, headY - 2, 24, 0, Math.PI * 2);
    ctx.fill();
  } else if (!blocking && (f.hitFlash > 0 || f.advFlash > 0)) {
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
      block: keys.has("g"),
      crouch: keys.has("s"),
      cycleWeapon: keys.has("q"),
    },
    p2: {
      move: movementInput(keys, "arrowleft", "arrowright"),
      jump: keys.has("arrowup"),
      attack: keys.has("k"),
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
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [roundOver, setRoundOver] = useState(false);

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
      "s",
      "g",
      "q",
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
      if (trackedKeys.includes(k) || code === "Space") {
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

      if (!game.roundOver) {
        const elapsed = now - lastFrameTimeRef.current;
        lastFrameTimeRef.current = now;
        accumulatorRef.current += Math.min(elapsed, TICK_MS * MAX_STEPS_PER_FRAME);

        let steps = 0;
        while (
          accumulatorRef.current >= TICK_MS &&
          steps < MAX_STEPS_PER_FRAME &&
          !game.roundOver
        ) {
          stepGame(game, snapshotInputs(keysRef.current));
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
      const kSet = keysRef.current;
      drawStick(ctx, a, "#38bdf8", isBlocking(a, kSet.has("g")), t, 0, landLocal);
      drawStick(ctx, b, "#f87171", isBlocking(b, kSet.has("l")), t, 1, landLocal);

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
  }, [resetRound, syncHudFromGame]);

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
        Hold guard while grounded (<kbd className="rounded border bg-muted px-1">G</kbd> blue,{" "}
        <kbd className="rounded border bg-muted px-1">L</kbd> red). A successful block stuns the
        attacker and gives you{" "}
        <strong className="text-foreground">frame advantage</strong>:
        your attack cooldown drains twice as fast for a short window — you recover first.
        Crouch with <kbd className="rounded border bg-muted px-1">S</kbd> /{" "}
        <kbd className="rounded border bg-muted px-1">↓</kbd>; cycle weapons with{" "}
        <kbd className="rounded border bg-muted px-1">Q</kbd> /{" "}
        <kbd className="rounded border bg-muted px-1">P</kbd>.
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
            Move <kbd className="rounded border bg-background px-1">A</kbd> /{" "}
            <kbd className="rounded border bg-background px-1">D</kbd> · Jump{" "}
            <kbd className="rounded border bg-background px-1">W</kbd> or{" "}
            <kbd className="rounded border bg-background px-1">Space</kbd> ·
            Attack <kbd className="rounded border bg-background px-1">F</kbd> ·
            Guard <kbd className="rounded border bg-background px-1">G</kbd> ·
            Crouch <kbd className="rounded border bg-background px-1">S</kbd> ·
            Weapon <kbd className="rounded border bg-background px-1">Q</kbd>
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
          <p>
            Move <kbd className="rounded border bg-background px-1">←</kbd> /{" "}
            <kbd className="rounded border bg-background px-1">→</kbd> · Jump{" "}
            <kbd className="rounded border bg-background px-1">↑</kbd> ·
            Attack <kbd className="rounded border bg-background px-1">K</kbd> ·
            Guard{" "}
            <kbd className="rounded border bg-background px-1">L</kbd> · Crouch{" "}
            <kbd className="rounded border bg-background px-1">↓</kbd> · Weapon{" "}
            <kbd className="rounded border bg-background px-1">P</kbd>
          </p>
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
