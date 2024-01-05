import { type Mesh, type Scene, SceneLoader } from '@babylonjs/core';

export default async function loadMesh(pathToMesh: string, scene: Scene) {
  const result = await SceneLoader.ImportMeshAsync(
    '',
    pathToMesh,
    undefined,
    scene
  );
  const id = pathToMesh.split('/').pop();
  if (!id) {
    throw new Error(`Mesh ID not found in ${pathToMesh}`);
  }

  const name = id.split('.')[0];

  if (!name) {
    throw new Error(`Mesh name not found in ${pathToMesh}`);
  }

  const rootMesh = result.meshes[0];
  rootMesh.receiveShadows = true;
  const meshes = result.meshes.slice(1) as Mesh[];

  for (const mesh of meshes) {
    mesh.receiveShadows = true;
  }

  return {
    id,
    name,
    rootMesh,
    meshes,
  };
}
