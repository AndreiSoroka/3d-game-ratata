import environmentUrl from './coordinates.json?url';
import getMesh from '@/entities/Game/envirement/getMesh';
import type { Scene, ShadowGenerator } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core';

type Environment = {
  name: string;
  location: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

function convertBlenderToBabylonCoordinates(vector: Environment['location']) {
  const [x, y, z] = vector;
  return new Vector3(-x, z, y);
}

function convertBlenderToBabylonRotation(vector: Environment['rotation']) {
  const [x, y, z] = vector;
  return new Vector3(-x, -y, z);
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
  for (const { name, location, rotation, scale } of environment) {
    await getMesh({
      id: name,
      name: name.split('.')[0],
      scene,
      shadow,
      position: convertBlenderToBabylonCoordinates(location),
      rotation: convertBlenderToBabylonRotation(rotation),
      scale: convertBlenderToBabylonScale(scale),
    });
    // mesh.receiveShadows = true;
    // shadow.addShadowCaster(mesh);
  }
}
