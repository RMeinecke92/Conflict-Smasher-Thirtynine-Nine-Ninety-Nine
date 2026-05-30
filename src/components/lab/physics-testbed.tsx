"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  completeTrial,
  createAutoTunerState,
  isTrialComplete,
  recordTrialSample,
  trialRemainingMs,
  toggleAutoTuner,
} from "@/lib/lab/auto-tuner";
import { MAX_STEPS_PER_FRAME, TICK_MS, VIEW_H, VIEW_W } from "@/lib/lab/constants";
import { updateGait } from "@/lib/lab/gait";
import { drawLabScene } from "@/lib/lab/render";
import { applyImpulseToPart, findNearestPart } from "@/lib/lab/ragdoll";
import {
  getBalanceParams,
  nudgeBalanceParam,
  resetBalanceParams,
} from "@/lib/lab/runtime-tuning";
import type { BalanceState, CharacterState, LabWorld } from "@/lib/lab/types";
import {
  applyUprightTorque,
  createBalanceState,
  getBalanceDebug,
  triggerCollapse,
  updateBalanceState,
} from "@/lib/lab/upright-control";
import { createLabWorld, getWorldBounds, resetCharacter, stepWorld } from "@/lib/lab/world";
import { Button } from "@/components/ui/button";

function canvasToWorld(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = VIEW_W / rect.width;
  const scaleY = VIEW_H / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

export function PhysicsTestbed() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<LabWorld | null>(null);
  const balanceRef = useRef<BalanceState>(createBalanceState());
  const tunerRef = useRef(createAutoTunerState(0, true));
  const keysRef = useRef({ left: false, right: false });
  const accumulatorRef = useRef(0);
  const lastFrameRef = useRef(0);
  const fpsSamplesRef = useRef<number[]>([]);
  const hudTickRef = useRef(0);

  const [autoTuneEnabled, setAutoTuneEnabled] = useState(false);
  const [hud, setHud] = useState({
    state: "active" as CharacterState,
    angleDeg: 0,
    angularVelocity: 0,
    kneeBendDeg: 0,
    headY: 0,
    targetHeadY: 0,
    gravityPerStep: 0,
    maxSafeUpwardPerMass: 0,
    fps: 0,
    trialRemainingSec: 10,
    trialIndex: 0,
    lastNotes: [] as string[],
    lastScore: null as number | null,
    torsoTorque: 0.38,
    legTorque: 0.1,
    clickImpulse: 0.008,
    maxVerticalSpeed: 4,
  });

  const syncHudFromSim = useCallback(
    (world: LabWorld, now: number, fps: number) => {
      const debug = getBalanceDebug(world.character);
      const params = getBalanceParams();
      setHud({
        state: balanceRef.current.mode,
        angleDeg: debug.angleDeg,
        angularVelocity: debug.angularVelocity,
        kneeBendDeg: debug.kneeBendDeg,
        headY: debug.headY,
        targetHeadY: tunerRef.current.targetHeadY,
        gravityPerStep: debug.gravityPerStep,
        maxSafeUpwardPerMass: debug.maxSafeUpwardPerMass,
        fps,
        trialRemainingSec: trialRemainingMs(tunerRef.current, now) / 1000,
        trialIndex: tunerRef.current.trialIndex,
        lastNotes: tunerRef.current.lastNotes,
        lastScore: tunerRef.current.lastReport?.score ?? null,
        torsoTorque: params.torsoUprightTorque,
        legTorque: params.legStraightenTorque,
        clickImpulse: params.clickImpulse,
        maxVerticalSpeed: params.maxVerticalSpeed,
      });
    },
    [],
  );

  useEffect(() => {
    resetBalanceParams();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    worldRef.current = createLabWorld();
    balanceRef.current = createBalanceState(now);
    tunerRef.current = createAutoTunerState(now, autoTuneEnabled);
    accumulatorRef.current = 0;
    lastFrameRef.current = now;
    fpsSamplesRef.current = [];
    hudTickRef.current = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") keysRef.current.left = true;
      if (e.code === "ArrowRight") keysRef.current.right = true;

      if (e.code === "Space" && !e.repeat && document.activeElement === canvas) {
        e.preventDefault();
        balanceRef.current = triggerCollapse(
          balanceRef.current,
          performance.now(),
        );
      }

      // Manual nudge while tuning: [ ] = leg torque, - = = torso torque
      if (document.activeElement === canvas && !e.repeat) {
        if (e.code === "BracketLeft") {
          nudgeBalanceParam("legStraightenTorque", -0.02);
        }
        if (e.code === "BracketRight") {
          nudgeBalanceParam("legStraightenTorque", 0.02);
        }
        if (e.code === "Minus") {
          nudgeBalanceParam("torsoUprightTorque", -0.02);
        }
        if (e.code === "Equal") {
          nudgeBalanceParam("torsoUprightTorque", 0.02);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") keysRef.current.left = false;
      if (e.code === "ArrowRight") keysRef.current.right = false;
    };

    const onClick = (e: MouseEvent) => {
      const world = worldRef.current;
      if (!world) return;

      const { x, y } = canvasToWorld(canvas, e.clientX, e.clientY);
      const partId = findNearestPart(world.character, x, y);
      applyImpulseToPart(
        world.character,
        partId,
        x,
        y,
        getBalanceParams().clickImpulse,
      );
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("click", onClick);

    let rafId = 0;

    const step = (frameNow: number) => {
      const world = worldRef.current;
      if (!world || !ctx) {
        rafId = requestAnimationFrame(step);
        return;
      }

      const elapsed = Math.min(
        frameNow - lastFrameRef.current,
        TICK_MS * MAX_STEPS_PER_FRAME,
      );
      lastFrameRef.current = frameNow;
      accumulatorRef.current += elapsed;

      if (isTrialComplete(tunerRef.current, frameNow)) {
        const result = completeTrial(
          tunerRef.current,
          getBalanceParams(),
          frameNow,
        );
        tunerRef.current = result.state;
        worldRef.current = resetCharacter(world);
        balanceRef.current = createBalanceState(frameNow);
        accumulatorRef.current = 0;
      }

      balanceRef.current = updateBalanceState(balanceRef.current, frameNow);

      const walkDir: -1 | 0 | 1 = keysRef.current.left
        ? -1
        : keysRef.current.right
          ? 1
          : 0;

      let steps = 0;
      while (accumulatorRef.current >= TICK_MS && steps < MAX_STEPS_PER_FRAME) {
        applyUprightTorque(world.character, balanceRef.current.uprightStrength);

        if (balanceRef.current.mode === "active") {
          updateGait(world.character, walkDir);
        }

        stepWorld(world.engine, TICK_MS);
        accumulatorRef.current -= TICK_MS;
        steps++;
      }

      if (tunerRef.current.enabled) {
        const debug = getBalanceDebug(world.character);
        tunerRef.current = recordTrialSample(tunerRef.current, {
          headY: debug.headY,
          footY: debug.footY,
          torsoTiltDeg: debug.angleDeg,
          kneeBendDeg: debug.kneeBendDeg,
        });
      }

      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      const pixelW = Math.round(cssW * dpr);
      const pixelH = Math.round(cssH * dpr);

      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }

      const scale = cssW / VIEW_W;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.save();
      ctx.scale(scale, scale);
      drawLabScene(ctx, world.character);
      ctx.restore();

      const frameMs = elapsed || 16.67;
      const samples = fpsSamplesRef.current;
      samples.push(1000 / frameMs);
      if (samples.length > 30) samples.shift();
      const fps =
        samples.reduce((sum, value) => sum + value, 0) / samples.length;

      hudTickRef.current += 1;
      if (hudTickRef.current % 6 === 0) {
        syncHudFromSim(world, frameNow, fps);
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("click", onClick);
      worldRef.current = null;
    };
  }, [autoTuneEnabled, syncHudFromSim]);

  const { width, height } = getWorldBounds();

  const handleToggleAutoTune = () => {
    const next = !autoTuneEnabled;
    setAutoTuneEnabled(next);
    tunerRef.current = toggleAutoTuner(
      tunerRef.current,
      next,
      performance.now(),
    );
    if (worldRef.current) {
      worldRef.current = resetCharacter(worldRef.current);
      balanceRef.current = createBalanceState(performance.now());
    }
  };

  const handleResetTrial = () => {
    resetBalanceParams();
    tunerRef.current = createAutoTunerState(performance.now(), autoTuneEnabled);
    if (worldRef.current) {
      worldRef.current = resetCharacter(worldRef.current);
      balanceRef.current = createBalanceState(performance.now());
    }
  };

  return (
    <div className="relative w-full space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={handleToggleAutoTune}>
          Auto-tune: {autoTuneEnabled ? "ON" : "OFF"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={handleResetTrial}>
          Reset trial & params
        </Button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="aspect-[720/380] w-full rounded-md border border-border bg-slate-100 outline-none focus:ring-2 focus:ring-ring"
          style={{ maxWidth: width }}
          width={width}
          height={height}
          aria-label="Stick figure physics testbed"
        />
        <div className="pointer-events-none absolute left-2 top-2 max-w-[240px] rounded bg-black/80 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-white">
          <div>State: {hud.state}</div>
          <div>
            Head Y: {hud.headY.toFixed(0)} / target {hud.targetHeadY.toFixed(0)}
          </div>
          <div>Torso tilt: {hud.angleDeg.toFixed(1)}° · Knee: {hud.kneeBendDeg.toFixed(1)}°</div>
          <div>
            Trial #{hud.trialIndex} · reset in {hud.trialRemainingSec.toFixed(1)}s
          </div>
          {hud.lastScore !== null && (
            <div>Last score: {hud.lastScore.toFixed(1)} (lower is better)</div>
          )}
          <div className="mt-1 border-t border-white/20 pt-1">
            torso {hud.torsoTorque.toFixed(3)} · leg {hud.legTorque.toFixed(3)}
          </div>
          <div>
            click {hud.clickImpulse.toFixed(4)} · maxVy {hud.maxVerticalSpeed.toFixed(1)}
          </div>
          {hud.lastNotes[0] && (
            <div className="mt-1 text-emerald-300">{hud.lastNotes[0]}</div>
          )}
          <div className="mt-1 text-white/70">FPS: {hud.fps.toFixed(0)}</div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Click canvas to focus. ← → walk · Space collapse · Click impulse. Manual nudge:{" "}
        <kbd className="rounded border px-1">[</kbd>{" "}
        <kbd className="rounded border px-1">]</kbd> leg torque ·{" "}
        <kbd className="rounded border px-1">-</kbd>{" "}
        <kbd className="rounded border px-1">=</kbd> torso torque. Every 10s auto-tune
        resets the ragdoll, scores head height / knee bend / lift-off, and adjusts params.
      </p>
    </div>
  );
}
