import { computeTargetHeadY } from "../src/lib/lab/auto-tuner";
import { FLOOR_Y, TICK_MS } from "../src/lib/lab/constants";
import { getHipHeight } from "../src/lib/lab/leg-support";
import { resetBalanceParams } from "../src/lib/lab/runtime-tuning";
import {
  applyUprightTorque,
  createBalanceState,
  getBalanceDebug,
} from "../src/lib/lab/upright-control";
import { createLabWorld, stepWorld } from "../src/lib/lab/world";

const TRIAL_MS = 10_000;
const steps = Math.floor(TRIAL_MS / TICK_MS);

resetBalanceParams();
const world = createLabWorld();
const balance = createBalanceState(0);
const targetHeadY = computeTargetHeadY();

function snapshot(step: number) {
  const d = getBalanceDebug(world.character);
  console.log(
    `t=${(step * TICK_MS) / 1000}s headY=${d.headY.toFixed(1)} hipY=${d.hipY.toFixed(1)} knee=${d.kneeBendDeg.toFixed(0)}°`,
  );
}

const headYs: number[] = [];
let offGround = 0;

for (let i = 0; i < steps; i++) {
  if (i === 0 || i === 60 || i === 300 || i === 599) snapshot(i);

  applyUprightTorque(world.character, 1);
  stepWorld(world.engine, TICK_MS);

  const d = getBalanceDebug(world.character);
  headYs.push(d.headY);
  if (d.footY < FLOOR_Y - 18) offGround++;
}

const avgHeadY = headYs.reduce((a, b) => a + b, 0) / headYs.length;
const final = getBalanceDebug(world.character);

console.log("\n=== Summary ===");
console.log(`Target head Y: ${targetHeadY.toFixed(1)}`);
console.log(`Avg head Y:    ${avgHeadY.toFixed(1)} (delta ${(avgHeadY - targetHeadY).toFixed(1)})`);
console.log(`Final hip Y:   ${getHipHeight(world.character).toFixed(1)} (spawn ${world.character.spawnHipY.toFixed(1)})`);
console.log(`Final knee:    ${final.kneeBendDeg.toFixed(1)}°`);

if (avgHeadY - targetHeadY > 35) {
  console.log("VERDICT: collapsed");
  process.exit(1);
}
console.log("VERDICT: ok");
