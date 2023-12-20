import retroMedievalKit from './retroMedievalKit';
import checkpoint from './checkpoint';
import {
  InstancedMesh,
  Matrix,
  type Mesh,
  PhysicsAggregate,
  PhysicsShapeType,
  Quaternion,
  type Scene,
  SceneLoader,
  ShadowGenerator,
  TransformNode,
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
  const meshes$ = from([...retroMedievalKit, ...checkpoint]).pipe(
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
let envParent: TransformNode | null = null;

export async function destroyListOfMeshes() {
  if (!listOfMeshesPromise) {
    return;
  }
  const listOfMeshes = await listOfMeshesPromise;

  for (const mesh of Object.values(listOfMeshes)) {
    if (!mesh) {
      continue;
    }
    mesh.rootMesh.dispose();
    for (const childMesh of mesh.meshes) {
      childMesh.dispose();
    }
  }
}

export default async function getMesh(paylaod: {
  id: string;
  name: string;
  scene: Scene;
  shadow: ShadowGenerator;
  position: Vector3;
  rotation: Vector3 | Quaternion;
  scale: Vector3;
}): Promise<Mesh[]> {
  if (!listOfMeshesPromise) {
    listOfMeshesPromise = loadMeshes(paylaod.scene);
    envParent = new TransformNode(`env`, paylaod.scene);
  }

  const listOfMeshes = await listOfMeshesPromise;

  const mesh = listOfMeshes[paylaod.name];
  if (!mesh) {
    throw new Error(`Mesh ${paylaod.name} not found`);
  }

  const meshes: Mesh[] = [];
  mesh.meshes.forEach((childMesh, index) => {
    const clonedChildMesh = childMesh.clone(
      `${paylaod.id}-${index}`,
      envParent
    );
    if (!clonedChildMesh) {
      throw new Error(`Mesh ${childMesh.name} not found`);
    }
    meshes.push(clonedChildMesh);
    clonedChildMesh.isVisible = true;
    // clonedChildMesh.parent = newMesh;
    clonedChildMesh.position = paylaod.position;
    if (paylaod.rotation instanceof Quaternion) {
      clonedChildMesh.rotationQuaternion = paylaod.rotation.clone();
    } else {
      clonedChildMesh.rotation = paylaod.rotation.clone();
    }
    clonedChildMesh.scaling = paylaod.scale.clone();
    clonedChildMesh.updatePoseMatrix(Matrix.Identity());

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
  return meshes;
}
