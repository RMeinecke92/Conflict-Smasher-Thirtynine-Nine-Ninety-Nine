"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  BIND_OFFSETS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  JOINT_ANGLE_LIMITS,
  JOINT_HIT_RADIUS,
  JOINT_KEYS,
} from "./constants";
import {
  computeSkeletonLayout,
  worldPointToJointAngle,
} from "./kinematics";
import type { JointKey, PoseJSON } from "./types";
import { clamp, normalizeAngle, radiansToDegrees } from "./utils";

export type ReferenceImageState = {
  url: string | null;
  opacity: number;
  scale: number;
  offsetX: number;
  offsetY: number;
};

type PoseCanvasProps = {
  pose: PoseJSON;
  referenceImage: ReferenceImageState;
  activeJoint: JointKey | null;
  onJointAngleChange: (joint: JointKey, angle: number) => void;
  onActiveJointChange: (joint: JointKey | null) => void;
};

function canvasPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function findJointAt(
  x: number,
  y: number,
  layout: ReturnType<typeof computeSkeletonLayout>,
): JointKey | null {
  let best: JointKey | null = null;
  let bestDist = JOINT_HIT_RADIUS ** 2;

  for (const key of JOINT_KEYS) {
    const pos = layout.jointPositions[key];
    const dx = x - pos.x;
    const dy = y - pos.y;
    const dist = dx * dx + dy * dy;
    if (dist <= bestDist) {
      bestDist = dist;
      best = key;
    }
  }

  return best;
}

export function PoseCanvas({
  pose,
  referenceImage,
  activeJoint,
  onJointAngleChange,
  onActiveJointChange,
}: PoseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const draggingRef = useRef<JointKey | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const layout = computeSkeletonLayout(pose);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 1;
    const gridStep = 40;
    for (let x = 0; x <= CANVAS_WIDTH; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    const img = imageRef.current;
    if (img && img.complete && referenceImage.url) {
      ctx.save();
      ctx.globalAlpha = referenceImage.opacity;
      const drawW = img.naturalWidth * referenceImage.scale;
      const drawH = img.naturalHeight * referenceImage.scale;
      const drawX =
        CANVAS_WIDTH / 2 - drawW / 2 + referenceImage.offsetX;
      const drawY =
        CANVAS_HEIGHT / 2 - drawH / 2 + referenceImage.offsetY;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    }

    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#38bdf8";

    for (const segment of layout.segments) {
      ctx.beginPath();
      ctx.moveTo(segment.x1, segment.y1);
      ctx.lineTo(segment.x2, segment.y2);
      ctx.stroke();
    }

    for (const key of JOINT_KEYS) {
      const pos = layout.jointPositions[key];
      const isActive = key === activeJoint || key === draggingRef.current;

      ctx.beginPath();
      ctx.fillStyle = isActive ? "#fbbf24" : "#e2e8f0";
      ctx.arc(pos.x, pos.y, isActive ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (isActive) {
        const deg = radiansToDegrees(pose.joints[key]);
        const label = `${deg.toFixed(0)}°`;
        ctx.font = "12px ui-monospace, monospace";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(label, pos.x + 10, pos.y - 10);
      }
    }

    ctx.beginPath();
    ctx.fillStyle = "#f87171";
    ctx.arc(layout.root.x, layout.root.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }, [pose, referenceImage, activeJoint]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (!referenceImage.url) {
      imageRef.current = null;
      draw();
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      draw();
    };
    img.src = referenceImage.url;

    return () => {
      img.onload = null;
    };
  }, [referenceImage.url, draw]);

  const updateJointFromPointer = useCallback(
    (joint: JointKey, clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const layout = computeSkeletonLayout(pose);
      const pos = layout.jointPositions[joint];
      const parentAngle = layout.jointParentAngles[joint];
      const pt = canvasPoint(canvas, clientX, clientY);

      let angle = worldPointToJointAngle(
        joint,
        pos.x,
        pos.y,
        pt.x,
        pt.y,
        parentAngle,
        BIND_OFFSETS[joint],
      );
      angle = normalizeAngle(angle);
      onJointAngleChange(joint, angle);
    },
    [pose, onJointAngleChange],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const layout = computeSkeletonLayout(pose);
    const pt = canvasPoint(canvas, event.clientX, event.clientY);
    const joint = findJointAt(pt.x, pt.y, layout);
    if (!joint) return;

    draggingRef.current = joint;
    onActiveJointChange(joint);
    canvas.setPointerCapture(event.pointerId);
    updateJointFromPointer(joint, event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const joint = draggingRef.current;
    if (!joint) return;
    updateJointFromPointer(joint, event.clientX, event.clientY);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggingRef.current) {
      draggingRef.current = null;
      const canvas = canvasRef.current;
      canvas?.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="w-full max-w-full cursor-crosshair rounded-md border border-slate-700 bg-slate-900 touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      aria-label="Pose skeleton canvas"
    />
  );
}

export function clampJointAngle(joint: JointKey, angle: number): number {
  const { min, max } = JOINT_ANGLE_LIMITS[joint];
  return clamp(normalizeAngle(angle), min, max);
}
