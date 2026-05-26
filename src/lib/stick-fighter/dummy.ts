import type { PlayerInput } from "@/lib/stick-fighter/simulation";

export type DummyBehavior = "standStill";

const STAND_STILL_INPUT: PlayerInput = {
  move: 0,
  jump: false,
  attack: false,
  uppercut: false,
  block: false,
  crouch: false,
  cycleWeapon: false,
};

export function computeDummyInput(): PlayerInput {
  return STAND_STILL_INPUT;
}
