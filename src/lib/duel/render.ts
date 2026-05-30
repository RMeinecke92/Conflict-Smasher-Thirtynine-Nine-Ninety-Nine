import { FLOOR_Y, SEGMENT, VIEW_H, VIEW_W } from "@/lib/lab/constants";
import { getStickSkeleton } from "@/lib/lab/ragdoll-geometry";

import { weaponButt, weaponTip } from "@/lib/duel/fighter";
import type { Fighter } from "@/lib/duel/fighter";
import type { DuelWorld } from "@/lib/duel/world";

const FIGHTER_COLORS: [string, string] = ["#1d4ed8", "#b91c1c"];

// Render-only ("fake") leg lengths. The physics legs sit nearly straight at
// standing height, so we draw the legs a touch longer than the real hip→ankle
// gap to guarantee a natural forward knee bend. This is cosmetic: the feet
// still land on the real physics foot anchors, so the legs stay glued to where
// the body is actually balanced — we just control how the knee looks.
const LEG_BEND_SCALE = 1.15;
const VIS_UPPER = SEGMENT.UPPER_LIMB_H * LEG_BEND_SCALE;
const VIS_LOWER = SEGMENT.LOWER_LIMB_H * LEG_BEND_SCALE;

type Pt = { x: number; y: number };

function line(ctx: CanvasRenderingContext2D, a: Pt, b: Pt) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

/**
 * Two-bone IK: given a hip and an ankle, find where the knee should be so the
 * upper/lower leg segments connect them, bending the knee toward `facing`
 * (forward). Distance is clamped to the reachable range to stay stable.
 */
function solveKnee(
  hip: Pt,
  ankle: Pt,
  upperLen: number,
  lowerLen: number,
  facing: 1 | -1,
): Pt {
  const dx = ankle.x - hip.x;
  const dy = ankle.y - hip.y;
  const raw = Math.hypot(dx, dy) || 0.01;
  const ux = dx / raw;
  const uy = dy / raw;

  const maxLen = upperLen + lowerLen - 0.01;
  const minLen = Math.abs(upperLen - lowerLen) + 0.01;
  const d = Math.max(minLen, Math.min(maxLen, raw));

  // Distance along the hip→ankle axis to the knee's projection.
  const l1 = (d * d + upperLen * upperLen - lowerLen * lowerLen) / (2 * d);
  const h = Math.sqrt(Math.max(0, upperLen * upperLen - l1 * l1));

  // Perpendicular to the leg axis, flipped to bend the knee forward.
  let px = -uy;
  let py = ux;
  if (px * facing < 0) {
    px = -px;
    py = -py;
  }

  return {
    x: hip.x + ux * l1 + px * h,
    y: hip.y + uy * l1 + py * h,
  };
}

function drawSkeleton(ctx: CanvasRenderingContext2D, fighter: Fighter, now: number) {
  const s = getStickSkeleton(fighter.ragdoll);
  const flashing = now < fighter.hitFlashUntil;
  ctx.strokeStyle = flashing ? "#f87171" : FIGHTER_COLORS[fighter.index];
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  line(ctx, s.pelvis, s.neck);
  line(ctx, s.neck, s.head);
  ctx.beginPath();
  ctx.arc(s.head.x, s.head.y, SEGMENT.HEAD_R, 0, Math.PI * 2);
  ctx.stroke();

  line(ctx, s.shoulderL, s.upperArmL);
  line(ctx, s.upperArmL, s.lowerArmL);
  line(ctx, s.lowerArmL, s.handL);
  line(ctx, s.shoulderR, s.upperArmR);
  line(ctx, s.upperArmR, s.lowerArmR);
  line(ctx, s.lowerArmR, s.handR);

  // Fake IK legs: clean hip→knee→ankle bend instead of the raw (and splay-prone)
  // physics leg segments. Feet still sit on the real physics anchors.
  const facing = fighter.facing;
  const kneeL = solveKnee(s.hipL, s.ankleL, VIS_UPPER, VIS_LOWER, facing);
  const kneeR = solveKnee(s.hipR, s.ankleR, VIS_UPPER, VIS_LOWER, facing);
  line(ctx, s.hipL, kneeL);
  line(ctx, kneeL, s.ankleL);
  line(ctx, s.hipR, kneeR);
  line(ctx, kneeR, s.ankleR);

  // Short forward-pointing feet for grounding.
  line(ctx, s.ankleL, { x: s.footL.x + facing * 9, y: s.footL.y });
  line(ctx, s.ankleR, { x: s.footR.x + facing * 9, y: s.footR.y });
}

function drawWeapon(ctx: CanvasRenderingContext2D, fighter: Fighter) {
  const spec = fighter.weapon.spec;
  const butt = weaponButt(fighter);
  const tip = weaponTip(fighter);

  ctx.strokeStyle = spec.color;
  ctx.lineWidth = spec.id === "poleHammer" ? 4 : 3;
  ctx.lineCap = "round";
  line(ctx, butt, tip);

  if (spec.headRadius > 0) {
    ctx.fillStyle = spec.color;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, spec.headRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHpBar(
  ctx: CanvasRenderingContext2D,
  fighter: Fighter,
  x: number,
  align: "left" | "right",
) {
  const w = 240;
  const h = 14;
  const y = 16;
  const frac = Math.max(0, fighter.hp / fighter.maxHp);
  const barX = align === "left" ? x : x - w;

  ctx.fillStyle = "rgba(15,23,42,0.18)";
  ctx.fillRect(barX, y, w, h);
  ctx.fillStyle = FIGHTER_COLORS[fighter.index];
  const fillW = w * frac;
  ctx.fillRect(align === "left" ? barX : barX + (w - fillW), y, fillW, h);
  ctx.strokeStyle = "rgba(15,23,42,0.55)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barX, y, w, h);

  ctx.fillStyle = "#0f172a";
  ctx.font = "600 12px ui-sans-serif, system-ui";
  ctx.textBaseline = "top";
  ctx.textAlign = align === "left" ? "left" : "right";
  const label = `${fighter.weapon.spec.name}`;
  ctx.fillText(label, align === "left" ? barX : barX + w, y + h + 4);
}

export function drawDuelScene(
  ctx: CanvasRenderingContext2D,
  world: DuelWorld,
  now: number,
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  gradient.addColorStop(0, "#e0e7ff");
  gradient.addColorStop(1, "#f8fafc");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2;
  line(ctx, { x: 0, y: FLOOR_Y }, { x: VIEW_W, y: FLOOR_Y });

  for (const fighter of world.fighters) {
    drawWeapon(ctx, fighter);
    drawSkeleton(ctx, fighter, now);
  }

  drawHpBar(ctx, world.fighters[0], 16, "left");
  drawHpBar(ctx, world.fighters[1], VIEW_W - 16, "right");
}
