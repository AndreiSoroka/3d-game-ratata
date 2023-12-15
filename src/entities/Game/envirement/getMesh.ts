import retroMedievalKit from './retroMedievalKit';
import {
  type Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  type Scene,
  SceneLoader,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';
import { from, lastValueFrom, map, mergeAll, scan } from 'rxjs';

async function loadMesh(pathToMesh: string, scene: Scene) {
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

function loadMeshes(scene: Scene) {
  const meshes$ = from([...retroMedievalKit]).pipe(
    mergeAll(),
    map((module) => module.default),
    map((linkToMesh) => loadMesh(linkToMesh, scene)),
    mergeAll(),
    scan(
      (acc, meshData) => {
        if (acc[meshData.name]) {
          throw new Error(`Duplicate name ${meshData.name}`);
        }
        return { ...acc, [meshData.name]: meshData };
      },
      {} as {
        [key: string]: Awaited<ReturnType<typeof loadMesh>> | undefined;
      }
    )
  );
  return lastValueFrom(meshes$);
}

let listOfMeshesPromise: ReturnType<typeof loadMeshes> | null = null;

export default function getMesh(paylaod: {
  id: string;
  name: string;
  scene: Scene;
  shadow: ShadowGenerator;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}) {
  if (!listOfMeshesPromise) {
    listOfMeshesPromise = loadMeshes(paylaod.scene);
  }

  return listOfMeshesPromise.then((listOfMeshes) => {
    const mesh = listOfMeshes[paylaod.name];
    if (!mesh) {
      throw new Error(`Mesh ${paylaod.name} not found`);
    }

    mesh.meshes.forEach((childMesh, index) => {
      const clonedChildMesh = childMesh.createInstance(
        `${paylaod.id}-${index}`
        // newMesh
      );
      if (!clonedChildMesh) {
        throw new Error(`Mesh ${childMesh.name} not found`);
      }
      clonedChildMesh.isVisible = true;
      // clonedChildMesh.parent = newMesh;
      clonedChildMesh.position = paylaod.position;
      clonedChildMesh.rotation = paylaod.rotation;
      clonedChildMesh.scaling = paylaod.scale;

      clonedChildMesh.receiveShadows = true;
      paylaod.shadow.addShadowCaster(clonedChildMesh);

      new PhysicsAggregate(
        clonedChildMesh,
        PhysicsShapeType.MESH,
        {
          mass: 0,
          friction: 1,
        },
        paylaod.scene
      );
    });
  });
}
