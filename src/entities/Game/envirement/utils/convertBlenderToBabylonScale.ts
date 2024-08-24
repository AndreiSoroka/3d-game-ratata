import type { Environment } from '@/entities/Game/envirement/types';
import { Vector3 } from '@babylonjs/core';

export default function convertBlenderToBabylonScale(
  vector: Environment['scale']
) {
  const [x, y, z] = vector;
  return new Vector3(x, z, -y);
}
