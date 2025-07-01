export interface HatDirection {
  up?: boolean;
  down?: boolean;
  left?: boolean;
  right?: boolean;
}

export const HAT_EPSILON = 0.07;

const HAT_POSITIONS: Array<{ val: number } & HatDirection> = [
  { val: -1, up: true },
  { val: -0.714, up: true, right: true },
  { val: -0.428, right: true },
  { val: -0.142, down: true, right: true },
  { val: 0.142, down: true },
  { val: 0.428, down: true, left: true },
  { val: 0.714, left: true },
  { val: 1, up: true, left: true },
];

export function decodeHat(
  value: number,
  epsilon: number = HAT_EPSILON
): HatDirection {
  return HAT_POSITIONS.find((p) => Math.abs(p.val - value) < epsilon) || {};
}
