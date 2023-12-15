import type { Scene } from '@babylonjs/core';
import {
  Mesh,
  MeshBuilder,
  PhysicsHelper,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import type { PhysicsRadialExplosionEventOptions } from '@babylonjs/core';

export type VortexPayload = {
  radius: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  strength: number;
  height: number;
  duration: number;
};

export default class VortexAction {
  readonly #scene: Scene;
  readonly #physicsHelper: PhysicsHelper;
  #sphere: Mesh | null = null;
  #event: ReturnType<typeof PhysicsHelper.prototype.vortex> | null = null;

  #delayTimeoutId: number | null = null;
  #durationTimeoutId: number | null = null;

  constructor(options: {
    physicsHelper: PhysicsHelper;
    scene: Scene;
    payload: VortexPayload;
  }) {
    this.#scene = options.scene;
    this.#physicsHelper = options.physicsHelper;

    const actionOrigin = new Vector3(
      options.payload.position.x,
      options.payload.position.y,
      options.payload.position.z
    );
    const eventOrigin = new Vector3(
      options.payload.position.x,
      options.payload.position.y - options.payload.height / 2,
      options.payload.position.z
    );

    this.#event = this.#physicsHelper.vortex(
      eventOrigin,
      options.payload.radius,
      options.payload.strength,
      options.payload.height
    );

    this.#delayTimeoutId = setTimeout(() => {
      this.#startAction(
        actionOrigin,
        options.payload.radius,
        options.payload.height
      );
    }, 1000);

    this.#durationTimeoutId = setTimeout(() => {
      this.dispose();
    }, options.payload.duration + 1000);
  }

  #startAction(
    gravitationalFieldOrigin: Vector3,
    radius: number,
    height: number
  ) {
    this.#event?.enable();

    this.#sphere = this.#createCylinder(radius, height);
    this.#addMaterialToMesh(this.#sphere);
    this.#sphere.position = gravitationalFieldOrigin;
  }

  #addMaterialToMesh(sphere: any) {
    const sphereMaterial = new StandardMaterial('sphereMaterial', this.#scene);
    sphereMaterial.alpha = 0.2;
    sphereMaterial.disableLighting = true;
    sphere.material = sphereMaterial;
  }

  #createCylinder(radius: number, height: number) {
    return MeshBuilder.CreateCylinder(`action-Vortex-${Math.random()}`, {
      height: height,
      diameter: radius * 2,
    });
  }

  public dispose() {
    if (this.#delayTimeoutId) {
      clearTimeout(this.#delayTimeoutId);
    }
    if (this.#durationTimeoutId) {
      clearTimeout(this.#durationTimeoutId);
    }
    this.#sphere?.dispose();
    this.#event?.disable();
    this.#event?.dispose();
  }
}
