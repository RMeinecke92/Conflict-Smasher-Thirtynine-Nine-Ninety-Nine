"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VIEW_W = 720;
const VIEW_H = 380;
const FLOOR = VIEW_H - 44;
const GRAVITY = 0.62;
const MOVE_SPEED = 4.4;
const MOVE_WHILE_BLOCKING = 1.4;
const JUMP_V = -11.5;
const BLOCK_STUN_ATTACKER = 16;
const BLOCK_ADV_DEFENDER_FRAMES = 14;
const BLOCK_PUSHBACK = 2.75;
const KNOCKBACK_HIT = 5.5;
const MAX_HP = 100;

const WEAPONS = [
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

type Fighter = {
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
  /** edge-detect weapon cycle key */
  lastWeaponKey: boolean;
};

function makeFighter(x: number, facing: 1 | -1): Fighter {
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
    lastWeaponKey: false,
  };
}

function isGrounded(fighter: Fighter) {
  return fighter.y >= FLOOR - 1;
}

function isBlocking(fighter: Fighter, holdBlock: boolean) {
  return holdBlock && isGrounded(fighter);
}

function attackHitbox(f: Fighter) {
  const W = WEAPONS[f.weapon];
  if (f.atkFrame <= 0) return null;
  if (f.atkFrame > W.hitHigh || f.atkFrame < W.hitLow) return null;
  const w = W.boxW;
  const h = W.boxH;
  const x =
    f.facing === 1 ? f.x + W.reach : f.x - W.reach - w;
  return { x, y: f.y - 62, w, h };
}

function hurtbox(fighter: Fighter) {
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

/** Lead arm reaches farther during active hit frames */
function attackArmMultiplier(f: Fighter) {
  const W = WEAPONS[f.weapon];
  const inHit =
    f.atkFrame > 0 && f.atkFrame <= W.hitHigh && f.atkFrame >= W.hitLow;
  return inHit ? 1 : 0.4;
}

function drawStick(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  fighterColor: string,
  blocking: boolean,
  time: number,
) {
  const W = WEAPONS[f.weapon];
  const bob =
    f.atkFrame > 0 && !blocking ? Math.sin(f.atkFrame * 0.9) * 3 : 0;
  const cx = f.x;
  const footY = f.y;
  const lean =
    blocking || f.atkFrame === 0 ? 0 : f.facing * (f.atkFrame > W.atkDur * 0.4 ? 12 : 0);

  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const headY = footY - 78 + bob;
  ctx.strokeStyle = blocking ? `${fighterColor}cc` : fighterColor;
  ctx.beginPath();
  ctx.arc(cx + lean * 0.15, headY, 11, 0, Math.PI * 2);
  ctx.stroke();

  const shoulderY = footY - 58 + bob;
  ctx.beginPath();
  ctx.moveTo(cx + lean * 0.2, headY + 11);
  ctx.lineTo(cx + lean * 0.2, shoulderY + 28);
  ctx.stroke();

  const armExt =
    blocking ? 10 : (12 + W.reach * 2.8) * attackArmMultiplier(f);
  const leadX = blocking
    ? cx - 20 * f.facing + lean
    : cx + armExt * f.facing + lean;

  ctx.beginPath();
  ctx.moveTo(cx + lean * 0.2, shoulderY);
  ctx.lineTo(leadX, shoulderY - 6 + bob * 0.3);
  ctx.stroke();

  if (!blocking && f.weapon > 0 && f.atkFrame > 0) {
    ctx.strokeStyle = W.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + lean * 0.15 + f.facing * 8, shoulderY - 4);
    const span = armExt + 42;
    ctx.lineTo(
      cx + lean * 0.2 + (f.facing === 1 ? span : -span),
      shoulderY + 6 + bob * 0.2,
    );
    ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = fighterColor;
  }

  ctx.beginPath();
  ctx.moveTo(cx + lean * 0.2, shoulderY);
  ctx.lineTo(
    blocking ? cx + 18 * f.facing : cx - 18 * f.facing + lean * 0.3,
    shoulderY + (blocking ? 6 : 14) + bob * 0.2,
  );
  ctx.stroke();

  const stride =
    Math.sin(time * 0.012 + f.x * 0.02) * (Math.abs(f.vx) > 0.5 ? 1 : 0);
  ctx.strokeStyle = fighterColor + (blocking ? "99" : "");
  ctx.beginPath();
  ctx.moveTo(cx + lean * 0.2, footY - 30 + bob);
  ctx.lineTo(cx - 10 * f.facing - stride * 6 - (blocking ? 4 * f.facing : 0), footY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + lean * 0.2, footY - 30 + bob);
  ctx.lineTo(cx + 10 * f.facing + stride * 6 + (blocking ? 4 * f.facing : 0), footY);
  ctx.stroke();

  if (blocking) {
    ctx.strokeStyle = "rgba(248,250,252,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      cx + lean * 0.12,
      shoulderY + 12,
      18,
      Math.PI * 0.92,
      Math.PI * 2.28,
    );
    ctx.stroke();
  }

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

/** Try weapon cycle on rising edge */
function cycleWeaponEdge(
  fighter: Fighter,
  keyDown: boolean,
  armed: boolean,
) {
  if (!armed || fighter.atkFrame > 0 || fighter.atkCd > 0) {
    fighter.lastWeaponKey = keyDown;
    return;
  }
  if (keyDown && !fighter.lastWeaponKey)
    fighter.weapon = (fighter.weapon + 1) % WEAPONS.length;
  fighter.lastWeaponKey = keyDown;
}

export function StickFighterGame() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const fightersRef = useRef<[Fighter, Fighter]>([
    makeFighter(VIEW_W * 0.28, 1),
    makeFighter(VIEW_W * 0.72, -1),
  ]);
  const timeRef = useRef(0);
  const lastHudRef = useRef({ p1: MAX_HP, p2: MAX_HP, wp1: 0, wp2: 0 });
  const hudMsgRef = useRef("");
  const [hud, setHud] = useState<{
    p1: number;
    p2: number;
    wp1: string;
    wp2: string;
    msg: string;
  }>({
    p1: MAX_HP,
    p2: MAX_HP,
    wp1: WEAPONS[0].name,
    wp2: WEAPONS[0].name,
    msg: "",
  });
  const [roundOver, setRoundOver] = useState(false);

  const resetRound = useCallback(() => {
    fightersRef.current = [
      makeFighter(VIEW_W * 0.28, 1),
      makeFighter(VIEW_W * 0.72, -1),
    ];
    lastHudRef.current = { p1: MAX_HP, p2: MAX_HP, wp1: 0, wp2: 0 };
    hudMsgRef.current = "";
    setRoundOver(false);
    setHud({
      p1: MAX_HP,
      p2: MAX_HP,
      wp1: WEAPONS[0].name,
      wp2: WEAPONS[0].name,
      msg: "",
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const trackedKeys = [
      "a",
      "d",
      "w",
      "f",
      "s",
      "q",
      "arrowleft",
      "arrowright",
      "arrowup",
      "arrowdown",
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
        if (down && roundOver) {
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
    const step = () => {
      const keys = keysRef.current;
      const f = fightersRef.current;
      const [p1, p2] = f;
      const t = timeRef.current++;

      if (!roundOver) {
        const p1BlockHold = keys.has("s");
        const p2BlockHold = keys.has("arrowdown");
        const b1 = isBlocking(p1, p1BlockHold);
        const b2 = isBlocking(p2, p2BlockHold);

        const p1Frozen = p1.blockStun > 0;
        const p2Frozen = p2.blockStun > 0;

        cycleWeaponEdge(p1, keys.has("q"), !b1 && !p1Frozen);
        cycleWeaponEdge(p2, keys.has("p"), !b2 && !p2Frozen);

        const m1Speed = !b1 ? MOVE_SPEED : MOVE_WHILE_BLOCKING;
        const m2Speed = !b2 ? MOVE_SPEED : MOVE_WHILE_BLOCKING;

        p1.vx = 0;
        if (p1Frozen) {
          /* keep frozen — no directional input */
        } else if (keys.has("a")) {
          p1.vx = -m1Speed;
          if (!b1) p1.facing = -1;
        } else if (keys.has("d")) {
          p1.vx = m1Speed;
          if (!b1) p1.facing = 1;
        }

        if (!b1 && !p1Frozen && (keys.has("w") || keys.has("space")) && isGrounded(p1))
          p1.vy = JUMP_V;

        if (!p1Frozen && !b1 && p1.atkFrame === 0 && keys.has("f") && p1.atkCd === 0) {
          const W = WEAPONS[p1.weapon];
          p1.atkFrame = W.atkDur;
          p1.atkLanded = false;
          p1.atkCd = W.cooldown;
        }

        p2.vx = 0;
        if (p2Frozen) {
          //
        } else if (keys.has("arrowleft")) {
          p2.vx = -m2Speed;
          if (!b2) p2.facing = -1;
        } else if (keys.has("arrowright")) {
          p2.vx = m2Speed;
          if (!b2) p2.facing = 1;
        }

        if (!b2 && !p2Frozen && keys.has("arrowup") && isGrounded(p2))
          p2.vy = JUMP_V;

        if (!p2Frozen && !b2 && p2.atkFrame === 0 && keys.has("l") && p2.atkCd === 0) {
          const W = WEAPONS[p2.weapon];
          p2.atkFrame = W.atkDur;
          p2.atkLanded = false;
          p2.atkCd = W.cooldown;
        }

        for (const fighter of [p1, p2]) {
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

        const h1 = attackHitbox(p1);
        const h2 = attackHitbox(p2);
        const hb1 = hurtbox(p2);
        const hb2 = hurtbox(p1);

        if (h1 && !p1.atkLanded && rectsOverlap(h1, hb1)) {
          p1.atkLanded = true;
          if (b2) {
            p2.blockFlash = 10;
            p2.frameAdv = Math.max(p2.frameAdv, BLOCK_ADV_DEFENDER_FRAMES);
            p2.advFlash = 18;
            p1.blockStun = Math.max(p1.blockStun, BLOCK_STUN_ATTACKER);
            p1.x -= BLOCK_PUSHBACK * p1.facing;
            p2.x += BLOCK_PUSHBACK * p1.facing;
          } else {
            const W = WEAPONS[p1.weapon];
            p2.hp -= W.damage;
            p2.hitFlash = 8;
            p2.vx = KNOCKBACK_HIT * p1.facing;
            p2.vy = -3;
          }
        }
        if (h2 && !p2.atkLanded && rectsOverlap(h2, hb2)) {
          p2.atkLanded = true;
          if (b1) {
            p1.blockFlash = 10;
            p1.frameAdv = Math.max(p1.frameAdv, BLOCK_ADV_DEFENDER_FRAMES);
            p1.advFlash = 18;
            p2.blockStun = Math.max(p2.blockStun, BLOCK_STUN_ATTACKER);
            p2.x -= BLOCK_PUSHBACK * p2.facing;
            p1.x += BLOCK_PUSHBACK * p2.facing;
          } else {
            const W = WEAPONS[p2.weapon];
            p1.hp -= W.damage;
            p1.hitFlash = 8;
            p1.vx = KNOCKBACK_HIT * p2.facing;
            p1.vy = -3;
          }
        }

        const w1Name = WEAPONS[p1.weapon].name;
        const w2Name = WEAPONS[p2.weapon].name;
        const w1i = p1.weapon;
        const w2i = p2.weapon;

        if (p1.hp <= 0 || p2.hp <= 0) {
          setRoundOver(true);
          lastHudRef.current = {
            p1: Math.max(0, p1.hp),
            p2: Math.max(0, p2.hp),
            wp1: w1i,
            wp2: w2i,
          };
          const win = p1.hp <= 0 ? "Red wins!" : "Blue wins!";
          hudMsgRef.current = win;
          setHud({
            p1: Math.max(0, p1.hp),
            p2: Math.max(0, p2.hp),
            wp1: w1Name,
            wp2: w2Name,
            msg: win,
          });
        } else {
          const p1h = p1.hp;
          const p2h = p2.hp;
          if (
            lastHudRef.current.p1 !== p1h ||
            lastHudRef.current.p2 !== p2h ||
            lastHudRef.current.wp1 !== w1i ||
            lastHudRef.current.wp2 !== w2i ||
            hudMsgRef.current !== ""
          ) {
            lastHudRef.current = { p1: p1h, p2: p2h, wp1: w1i, wp2: w2i };
            hudMsgRef.current = "";
            setHud({ p1: p1h, p2: p2h, wp1: w1Name, wp2: w2Name, msg: "" });
          }
        }
      }

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

      ctx.fillStyle = "#0f1419";
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.strokeStyle = "rgba(148,163,184,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, FLOOR + 6);
      ctx.lineTo(VIEW_W, FLOOR + 6);
      ctx.stroke();

      const [a, b] = fightersRef.current;
      const kSet = keysRef.current;
      drawStick(ctx, a, "#38bdf8", isBlocking(a, kSet.has("s")), t);
      drawStick(ctx, b, "#f87171", isBlocking(b, kSet.has("arrowdown")), t);

      ctx.restore();

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [resetRound, roundOver]);

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
        Hold block while grounded. A successful block stuns the attacker and
        gives you <strong className="text-foreground">frame advantage</strong>:
        your attack cooldown drains twice as fast for a short window — you recover
        first. Cycle weapons with{" "}
        <kbd className="rounded border bg-muted px-1">Q</kbd> /{" "}
        <kbd className="rounded border bg-muted px-1">P</kbd> (damage, reach, and
        speed trade off).
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
            Hold block <kbd className="rounded border bg-background px-1">S</kbd>{" "}
            · Weapon <kbd className="rounded border bg-background px-1">Q</kbd>
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
            Attack <kbd className="rounded border bg-background px-1">L</kbd> ·
            Hold block{" "}
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
