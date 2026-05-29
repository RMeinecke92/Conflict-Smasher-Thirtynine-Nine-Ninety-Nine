import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";
import type { PoseJSON } from "./types";

export function createTPose(
  name = "t_pose",
  character = "knight",
): PoseJSON {
  return {
    name,
    character,
    rootPosition: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT * 0.62,
    },
    rootRotation: 0,
    joints: {
      waist: 0,
      neck: 0,
      shoulderL: 0,
      shoulderR: 0,
      elbowL: 0,
      elbowR: 0,
      hipL: 0,
      hipR: 0,
      kneeL: 0,
      kneeR: 0,
    },
  };
}
