import { Vector3 } from '@babylonjs/core';
import type { Environment } from '@/entities/Game/envirement/types';

export default function convertBlenderToBabylonCoordinates(
  vector: Environment['location']
) {
  const [x, y, z] = vector;
  return new Vector3(x, z, y);
}
