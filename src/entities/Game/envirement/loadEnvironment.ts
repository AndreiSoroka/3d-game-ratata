import environmentUrl from './coordinates.json?url';
import getMesh from '@/entities/Game/envirement/getMesh';
import type { InstancedMesh, Scene, ShadowGenerator } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core';

export const listOfInstancedMeshes: Set<InstancedMesh> = new Set();

type Environment = {
  name: string;
  location: [number, number, number];
  rotation_mode: string | 'XYZ';
  rotation: [number, number, number, number];
  scale: [number, number, number];
};

function convertBlenderToBabylonCoordinates(vector: Environment['location']) {
  const [x, y, z] = vector;
  return new Vector3(x, z, -y);
}

const { PI } = Math;
const TWO_PI = PI * 2;
const HALF_PI = PI / 2;

function normalizeYAngle(angleInRadians: number) {
  // return angleInRadians;
  // if (angleInRadians === 0) {
  //   return PI;
  // }
  return angleInRadians;
  // if (angle === Math.PI /2) {
  //
  // }
  // if (angleInRadians === 0) {
  //   return Math.PI;
  // } else if (angleInRadians > 0) {
  //   return Math.PI - angleInRadians;
  // } else {
  //   return Math.PI + angleInRadians;
  // }
  // console.log(angle);
  // return -((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

function convertBlenderToBabylonRotation(
  vector: Environment['rotation'],
  rotation_mode: Environment['rotation_mode']
): Vector3 {
  if (rotation_mode === 'XYZ') {
    const [x, y, z] = vector;
    return new Vector3(x, normalizeYAngle(z), y);
  }
  throw new Error(`Unknown rotation mode ${rotation_mode}`);
}

function convertBlenderToBabylonScale(vector: Environment['scale']) {
  const [x, y, z] = vector;
  return new Vector3(x, z, y);
}

export default async function loadEnvironment(
  scene: Scene,
  shadow: ShadowGenerator
) {
  const environment: Environment[] = await fetch(environmentUrl).then((res) =>
    res.json()
  );
  for (const {
    name,
    location,
    rotation,
    rotation_mode,
    scale,
  } of environment) {
    const meshes = await getMesh({
      id: name,
      name: name.split('.')[0],
      scene,
      shadow,
      position: convertBlenderToBabylonCoordinates(location),
      rotation: convertBlenderToBabylonRotation(rotation, rotation_mode),
      scale: convertBlenderToBabylonScale(scale),
    });
    meshes.forEach((mesh) => {
      listOfInstancedMeshes.add(mesh);
    });
  }
}
