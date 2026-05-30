import { IDLE_INPUT } from "@/lib/duel/control";
import type { FighterInput } from "@/lib/duel/control";
import type { Fighter } from "@/lib/duel/fighter";

/** Per-fighter scratch state for the CPU; keyed by fighter index. */
type CpuMemory = {
  nextStrikeAt: number;
};

const memory: Record<number, CpuMemory> = {};

function mem(index: number): CpuMemory {
  if (!memory[index]) memory[index] = { nextStrikeAt: 0 };
  return memory[index];
}

export function resetCpu() {
  for (const key of Object.keys(memory)) delete memory[Number(key)];
}

/**
 * A stand-still training dummy: just holds long guard.
 */
export function dummyInput(): FighterInput {
  return IDLE_INPUT;
}

/**
 * A simple, readable CPU: close the distance until just inside weapon reach,
 * then throw an occasional strike. Backs off briefly after committing.
 */
export function cpuInput(self: Fighter, opponent: Fighter, now: number): FighterInput {
  if (self.balance.mode !== "active") return IDLE_INPUT;

  const dx = opponent.ragdoll.parts.torso.position.x - self.ragdoll.parts.torso.position.x;
  const dist = Math.abs(dx);
  const facing = self.facing;
  const reach = self.weapon.spec.reach;

  let move: -1 | 0 | 1 = 0;
  if (dist > reach * 0.85) {
    move = (Math.sign(dx) || facing) as -1 | 0 | 1;
  } else if (dist < reach * 0.5) {
    move = (-Math.sign(dx) || -facing) as -1 | 0 | 1;
  }

  const m = mem(self.index);
  let strikePressed = false;
  const inRange = dist <= reach * 0.95 && dist > reach * 0.4;
  const idle = self.action.name === "guard";
  if (inRange && idle && now >= m.nextStrikeAt) {
    strikePressed = true;
    m.nextStrikeAt = now + 700 + Math.random() * 900;
  }

  return { move, guard: true, strikePressed };
}
