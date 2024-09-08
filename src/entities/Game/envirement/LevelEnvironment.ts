import environmentUrl from './coordinates.json?url';
import type { Environment } from '@/entities/Game/envirement/types';
import isEnvironmentsGuard from '@/entities/Game/envirement/utils/isEnvironmentsGuard';
import {
  Matrix,
  type Mesh,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
  Quaternion,
  type Scene,
  type ShadowGenerator,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import convertBlenderToBabylonCoordinates from '@/entities/Game/envirement/utils/convertBlenderToBabylonCoordinates';
import convertBlenderToBabylonRotation from '@/entities/Game/envirement/utils/convertBlenderToBabylonRotation';
import convertBlenderToBabylonScale from '@/entities/Game/envirement/utils/convertBlenderToBabylonScale';
import loadAllMeshes from '@/entities/Game/envirement/utils/loadAllMeshes';
import getTypeOfMesh from '@/entities/Game/envirement/utils/getTypeOfMesh';

export default class LevelEnvironment {
  private readonly _scene: Scene;
  private readonly _shadow: ShadowGenerator;
  private readonly _listOfMeshesPromise: ReturnType<
    typeof loadAllMeshes
  > | null = null;
  private readonly _listOfEnvironmentMeshes: Set<Mesh> = new Set();
  public readonly isReadyPromise: Promise<void>;
  private _isReady = false;
  private _environmentCoordinates: Environment[] = [];
  private readonly _parentEnvironment: TransformNode;
  private readonly _parentCheckpoint: TransformNode;

  public checkPointsCoordinates: Vector3[] = [];

  constructor(payload: { scene: Scene; shadow: ShadowGenerator }) {
    this._scene = payload.scene;
    this._shadow = payload.shadow;

    this._listOfMeshesPromise = loadAllMeshes(this._scene);
    this._parentEnvironment = new TransformNode(`environment`, this._scene);
    this._parentCheckpoint = new TransformNode(`checkpoint`, this._scene);

    this.isReadyPromise = Promise.all([
      this._init(),
      this._listOfMeshesPromise,
    ]).then(() => {
      this._disposeListOfRootMeshes().then(() => {});
      this._isReady = true;
    });
  }

  async _init() {
    this._environmentCoordinates = await this._getEnvironmentCoordinates();

    // todo create util function
    const environmentCoordinates = this._environmentCoordinates.filter(
      ({ name }) => getTypeOfMesh(name) === 'environment'
    );
    const checkpointCoordinates = this._environmentCoordinates.filter(
      ({ name }) => getTypeOfMesh(name) === 'checkpoint'
    );

    // checkpoints
    this.checkPointsCoordinates = checkpointCoordinates.map(({ location }) =>
      convertBlenderToBabylonCoordinates(location)
    );

    // environment
    for (const {
      name,
      location,
      rotation,
      rotation_mode,
      scale,
    } of environmentCoordinates) {
      const meshes = await this._getMesh({
        id: name,
        name: name.split('.')[0],
        position: convertBlenderToBabylonCoordinates(location),
        rotation: convertBlenderToBabylonRotation(rotation, rotation_mode),
        scale: convertBlenderToBabylonScale(scale),
      });
      meshes.forEach((mesh) => {
        this._listOfEnvironmentMeshes.add(mesh);
        // todo merge materials by name
        if (mesh.material instanceof PBRMaterial) {
          // we don't have env textures for mirror and glass
          mesh.material.metallic = 0;
        }
      });
    }
  }

  private async _getMesh(payload: {
    id: string;
    name: string;
    position: Vector3;
    rotation: Vector3 | Quaternion;
    scale: Vector3;
  }): Promise<Mesh[]> {
    const listOfMeshes = await this._listOfMeshesPromise;
    if (!listOfMeshes) {
      throw new Error('listOfMeshes is not defined');
    }

    const mesh = listOfMeshes[payload.name];
    if (!mesh) {
      throw new Error(`Mesh ${payload.name} not found`);
    }

    // todo rudiment, checkpoint don't have mesh at the moment
    const typeOfMesh = getTypeOfMesh(payload.name);
    const envParent = (() => {
      switch (typeOfMesh) {
        case 'checkpoint':
          return this._parentCheckpoint;
        case 'environment':
          return this._parentEnvironment;
      }
    })();

    const meshes: Mesh[] = [];
    mesh.meshes.forEach((childMesh, index) => {
      const clonedChildMesh = childMesh.clone(
        `${payload.id}-${index}`,
        envParent
      );
      if (!clonedChildMesh) {
        throw new Error(`Mesh ${childMesh.name} not found`);
      }
      meshes.push(clonedChildMesh);
      clonedChildMesh.isVisible = true;
      // clonedChildMesh.parent = newMesh;
      clonedChildMesh.position = payload.position;
      if (payload.rotation instanceof Quaternion) {
        clonedChildMesh.rotationQuaternion = payload.rotation.clone();
      } else {
        clonedChildMesh.rotation = payload.rotation.clone();
      }
      clonedChildMesh.scaling = payload.scale.clone();
      clonedChildMesh.updatePoseMatrix(Matrix.Identity());

      clonedChildMesh.receiveShadows = true;
      this._shadow.addShadowCaster(clonedChildMesh);

      if (typeOfMesh === 'environment') {
        new PhysicsAggregate(
          clonedChildMesh,
          PhysicsShapeType.MESH,
          {
            mass: 0,
            friction: 1,
          },
          this._scene
        );
      }
    });
    return meshes;
  }

  private async _getEnvironmentCoordinates() {
    const response = await fetch(environmentUrl);
    const data: any = await response.json();
    if (!isEnvironmentsGuard(data)) {
      throw new Error('Environment data is not correct');
    }
    return data;
  }

  private async _disposeListOfRootMeshes() {
    if (!this._listOfMeshesPromise) {
      return;
    }
    const listOfMeshes = await this._listOfMeshesPromise;

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

  public async dispose() {
    await this.isReadyPromise;

    for (const mesh of this._listOfEnvironmentMeshes) {
      mesh.dispose();
    }
    this._listOfEnvironmentMeshes.clear();

    await this._disposeListOfRootMeshes();
  }
}
