import { FLOOR_Y, LINE_WIDTH, STROKE_COLOR, SEGMENT, VIEW_H, VIEW_W } from "@/lib/lab/constants";
import { getStickSkeleton } from "@/lib/lab/ragdoll-geometry";
import type { Ragdoll } from "@/lib/lab/types";

import type Matter from "matter-js";

function drawLine(
  ctx: CanvasRenderingContext2D,
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  radius: number,
) {
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFoot(ctx: CanvasRenderingContext2D, foot: Matter.Body) {
  const { FOOT_W, FOOT_H } = SEGMENT;
  const halfW = FOOT_W * 0.5;
  const halfH = FOOT_H * 0.5;

  ctx.save();
  ctx.translate(foot.position.x, foot.position.y);
  ctx.rotate(foot.angle);

  ctx.beginPath();
  ctx.moveTo(-halfW, halfH);
  ctx.lineTo(halfW, halfH);
  ctx.stroke();

  ctx.restore();
}

export function drawLabScene(ctx: CanvasRenderingContext2D, ragdoll: Ragdoll) {
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  gradient.addColorStop(0, "#dbeafe");
  gradient.addColorStop(1, "#f8fafc");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.strokeStyle = STROKE_COLOR;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(0, FLOOR_Y);
  ctx.lineTo(VIEW_W, FLOOR_Y);
  ctx.stroke();

  const s = getStickSkeleton(ragdoll);

  drawLine(ctx, s.pelvis, s.neck);
  drawLine(ctx, s.neck, s.head);
  drawHead(ctx, s.head, SEGMENT.HEAD_R);

  drawLine(ctx, s.shoulderL, s.upperArmL);
  drawLine(ctx, s.upperArmL, s.lowerArmL);
  drawLine(ctx, s.lowerArmL, s.handL);

  drawLine(ctx, s.shoulderR, s.upperArmR);
  drawLine(ctx, s.upperArmR, s.lowerArmR);
  drawLine(ctx, s.lowerArmR, s.handR);

  drawLine(ctx, s.hipL, s.upperLegL);
  drawLine(ctx, s.upperLegL, s.lowerLegL);
  drawLine(ctx, s.lowerLegL, s.ankleL);

  drawLine(ctx, s.hipR, s.upperLegR);
  drawLine(ctx, s.upperLegR, s.lowerLegR);
  drawLine(ctx, s.lowerLegR, s.ankleR);

  drawFoot(ctx, s.footBodyL);
  drawFoot(ctx, s.footBodyR);
}
