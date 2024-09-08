import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

const CHECKPOINT_RADIUS = 2;

interface ICheckPointService {}

export class CheckPointService implements ICheckPointService {
  private readonly _scene: Scene;
  private readonly _position: Vector3;
  private readonly _material: StandardMaterial;
  readonly mesh: Mesh;

  constructor(options: { scene: Scene; position: Vector3 }) {
    this._scene = options.scene;
    this._position = options.position;
    this._material = this.#createMaterial();
    this.mesh = this.#createPlayerMesh();
    this.mesh.material = this._material;
    this.mesh.position = this._position;
    this.mesh.receiveShadows = true;
  }

  #createMaterial() {
    const material = new StandardMaterial('CheckPointMaterial', this._scene);
    material.diffuseColor = Color3.FromHexString('#FF0000');
    material.emissiveColor = Color3.FromHexString('#438dc3');

    material.maxSimultaneousLights = 10;
    material.alpha = 0.1;
    return material;
  }

  #createPlayerMesh(name: string = 'CheckPoint' + Math.random()) {
    return MeshBuilder.CreateSphere(
      name,
      {
        segments: 64,
        diameter: CHECKPOINT_RADIUS * 2,
        sideOrientation: Mesh.FRONTSIDE,
      },
      this._scene
    );
  }

  dispose() {}
}
