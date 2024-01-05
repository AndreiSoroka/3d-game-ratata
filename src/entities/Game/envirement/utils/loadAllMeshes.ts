import type { Scene } from '@babylonjs/core';
import { from, lastValueFrom, map, mergeAll, scan } from 'rxjs';
import retroMedievalKit from '@/entities/Game/envirement/models/retroMedievalKit';
import checkpoint from '@/entities/Game/envirement/models/checkpoint';
import loadMesh from '@/entities/Game/envirement/utils/loadMesh';

export default function loadAllMeshes(scene: Scene) {
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
