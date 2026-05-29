export function radiansToDegrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Wrap radians to [-π, π]. */
export function normalizeAngle(rad: number): number {
  let a = rad;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function directionFromAngle(angle: number): { x: number; y: number } {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

export function addPoint(
  x: number,
  y: number,
  angle: number,
  length: number,
): { x: number; y: number } {
  return {
    x: x + Math.cos(angle) * length,
    y: y + Math.sin(angle) * length,
  };
}
