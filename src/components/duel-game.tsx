"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MAX_STEPS_PER_FRAME, TICK_MS, VIEW_H, VIEW_W } from "@/lib/lab/constants";
import { resetBalanceParams } from "@/lib/lab/runtime-tuning";
import { cpuInput, dummyInput } from "@/lib/duel/cpu";
import type { FighterInput } from "@/lib/duel/control";
import type { ControllerKind } from "@/lib/duel/fighter";
import { drawDuelScene } from "@/lib/duel/render";
import { WEAPONS } from "@/lib/duel/weapons";
import type { WeaponId } from "@/lib/duel/weapons";
import {
  createDuelWorld,
  destroyDuelWorld,
  stepDuelWorld,
} from "@/lib/duel/world";
import type { DuelWorld } from "@/lib/duel/world";
import { Button } from "@/components/ui/button";

type DuelMode = "vs" | "practice";

type Props = {
  mode: DuelMode;
};

function otherWeapon(id: WeaponId): WeaponId {
  return id === "longsword" ? "poleHammer" : "longsword";
}

export function DuelGame({ mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<DuelWorld | null>(null);
  const accumulatorRef = useRef(0);
  const lastFrameRef = useRef(0);
  const keysRef = useRef({
    p1Left: false,
    p1Right: false,
    p2Left: false,
    p2Right: false,
  });
  const strikeRef = useRef({ p1: false, p2: false });

  const [p1Weapon, setP1Weapon] = useState<WeaponId>("longsword");
  const [p2Weapon, setP2Weapon] = useState<WeaponId>("poleHammer");
  const [p2Human, setP2Human] = useState(false);
  const [roundId, setRoundId] = useState(0);
  const [winner, setWinner] = useState<0 | 1 | null>(null);

  const p2Controller: ControllerKind =
    mode === "practice" ? "dummy" : p2Human ? "human" : "cpu";

  useEffect(() => {
    resetBalanceParams();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setWinner(null);

    const now = performance.now();
    const world = createDuelWorld({ p1Weapon, p2Weapon, p2Controller });
    worldRef.current = world;
    accumulatorRef.current = 0;
    lastFrameRef.current = now;

    const onKeyDown = (e: KeyboardEvent) => {
      const k = keysRef.current;
      switch (e.code) {
        case "KeyA":
          k.p1Left = true;
          break;
        case "KeyD":
          k.p1Right = true;
          break;
        case "KeyW":
        case "Space":
          if (document.activeElement === canvas) e.preventDefault();
          if (!e.repeat) strikeRef.current.p1 = true;
          break;
        case "ArrowLeft":
          k.p2Left = true;
          if (document.activeElement === canvas) e.preventDefault();
          break;
        case "ArrowRight":
          k.p2Right = true;
          if (document.activeElement === canvas) e.preventDefault();
          break;
        case "ArrowUp":
          if (document.activeElement === canvas) e.preventDefault();
          if (!e.repeat) strikeRef.current.p2 = true;
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = keysRef.current;
      if (e.code === "KeyA") k.p1Left = false;
      if (e.code === "KeyD") k.p1Right = false;
      if (e.code === "ArrowLeft") k.p2Left = false;
      if (e.code === "ArrowRight") k.p2Right = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let rafId = 0;

    const buildInputs = (frameNow: number): [FighterInput, FighterInput] => {
      const k = keysRef.current;
      const p1: FighterInput = {
        move: k.p1Left ? -1 : k.p1Right ? 1 : 0,
        guard: true,
        strikePressed: strikeRef.current.p1,
      };
      strikeRef.current.p1 = false;

      let p2: FighterInput;
      if (p2Controller === "human") {
        p2 = {
          move: k.p2Left ? -1 : k.p2Right ? 1 : 0,
          guard: true,
          strikePressed: strikeRef.current.p2,
        };
        strikeRef.current.p2 = false;
      } else if (p2Controller === "cpu") {
        p2 = cpuInput(world.fighters[1], world.fighters[0], frameNow);
      } else {
        p2 = dummyInput();
      }
      return [p1, p2];
    };

    const step = (frameNow: number) => {
      if (!worldRef.current || !ctx) {
        rafId = requestAnimationFrame(step);
        return;
      }

      const elapsed = Math.min(
        frameNow - lastFrameRef.current,
        TICK_MS * MAX_STEPS_PER_FRAME,
      );
      lastFrameRef.current = frameNow;
      accumulatorRef.current += elapsed;

      const inputs = buildInputs(frameNow);

      let steps = 0;
      while (accumulatorRef.current >= TICK_MS && steps < MAX_STEPS_PER_FRAME) {
        stepDuelWorld(world, inputs, TICK_MS, frameNow);
        accumulatorRef.current -= TICK_MS;
        steps++;
      }

      if (world.status === "ko") {
        setWinner((prev) => (prev === null ? world.winner : prev));
      }

      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      const pixelW = Math.round(cssW * dpr);
      const pixelH = Math.round((cssW * VIEW_H) / VIEW_W * dpr);
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }

      const scale = cssW / VIEW_W;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, (cssW * VIEW_H) / VIEW_W);
      ctx.save();
      ctx.scale(scale, scale);
      drawDuelScene(ctx, world, frameNow);
      ctx.restore();

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (worldRef.current) destroyDuelWorld(worldRef.current);
      worldRef.current = null;
    };
  }, [p1Weapon, p2Weapon, p2Controller, roundId]);

  const rematch = useCallback(() => {
    setRoundId((n) => n + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (winner === null) return;
      if (e.code === "KeyR" || e.code === "Enter") {
        e.preventDefault();
        rematch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [winner, rematch]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-blue-700">P1</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setP1Weapon((w) => otherWeapon(w))}
        >
          {WEAPONS[p1Weapon].name}
        </Button>
        <span className="ml-3 font-medium text-red-700">P2</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setP2Weapon((w) => otherWeapon(w))}
        >
          {WEAPONS[p2Weapon].name}
        </Button>
        {mode === "vs" && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setP2Human((v) => !v)}
          >
            P2: {p2Human ? "Human" : "CPU"}
          </Button>
        )}
        <Button type="button" size="sm" variant="ghost" onClick={rematch}>
          Reset
        </Button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="aspect-[720/380] w-full rounded-md border border-border bg-slate-100 outline-none focus:ring-2 focus:ring-ring"
          width={VIEW_W}
          height={VIEW_H}
          aria-label="Physics weapon duel"
        />
        {winner !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md bg-black/55 text-white">
            <p className="font-heading text-2xl font-semibold">
              {winner === 0 ? "Blue" : "Red"} wins
            </p>
            <Button type="button" onClick={rematch}>
              Rematch (R / Enter)
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Click the arena to focus. <strong>P1 (blue):</strong>{" "}
        <kbd className="rounded border px-1">A</kbd>{" "}
        <kbd className="rounded border px-1">D</kbd> move ·{" "}
        <kbd className="rounded border px-1">W</kbd> /{" "}
        <kbd className="rounded border px-1">Space</kbd> strike.
        {mode === "vs" && (
          <>
            {" "}
            <strong>P2 (red):</strong>{" "}
            <kbd className="rounded border px-1">←</kbd>{" "}
            <kbd className="rounded border px-1">→</kbd> move ·{" "}
            <kbd className="rounded border px-1">↑</kbd> strike.
          </>
        )}{" "}
        Weapons stay in long guard until you strike. A clean hit knocks the
        opponent down — they recover after a moment.
      </p>
    </div>
  );
}
