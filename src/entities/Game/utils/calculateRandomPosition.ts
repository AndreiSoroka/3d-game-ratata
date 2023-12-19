import { Vector3 } from '@babylonjs/core';

export default function calculateRandomPosition(
  playerPosition: Vector3,
  maxRandomPosition: number
): { x: number; y: number; z: number } {
  const x =
    playerPosition.x +
    Math.random() * maxRandomPosition -
    maxRandomPosition / 2;
  const y =
    playerPosition.y +
    Math.random() * maxRandomPosition -
    maxRandomPosition / 2;
  const z =
    playerPosition.z +
    Math.random() * maxRandomPosition -
    maxRandomPosition / 2;

  return {
    x,
    y,
    z,
  };
}
