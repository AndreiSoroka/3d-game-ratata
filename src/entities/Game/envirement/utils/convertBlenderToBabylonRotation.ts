import type { Environment } from '@/entities/Game/envirement/types';
import { Vector3 } from '@babylonjs/core';

export default function convertBlenderToBabylonRotation(
  vector: Environment['rotation'],
  rotation_mode: Environment['rotation_mode']
): Vector3 {
  if (rotation_mode === 'XYZ') {
    const [x, y, z] = vector;
    return new Vector3(x, z, y).scale(-1);
  }
  throw new Error(`Unknown rotation mode ${rotation_mode}`);
}
