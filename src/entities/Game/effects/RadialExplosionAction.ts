import type { Scene } from '@babylonjs/core';
import {
  Mesh,
  MeshBuilder,
  PhysicsHelper,
  PhysicsRadialImpulseFalloff,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import type { PhysicsRadialExplosionEventOptions } from '@babylonjs/core';

export type RadialExplosionPayload = {
  radius: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  strength: number;
};

export default class RadialExplosionAction {
  readonly #scene: Scene;
  readonly #physicsHelper: PhysicsHelper;
  #sphere: Mesh | null = null;
  #event: ReturnType<
    typeof PhysicsHelper.prototype.applyRadialExplosionImpulse
  > | null = null;

  #delayTimeoutId: number | null = null;
  #durationTimeoutId: number | null = null;
  #loopIntervalId: number | null = null;

  constructor(options: {
    physicsHelper: PhysicsHelper;
    scene: Scene;
    payload: RadialExplosionPayload;
  }) {
    this.#scene = options.scene;
    this.#physicsHelper = options.physicsHelper;

    const gravitationalFieldOrigin = new Vector3(
      options.payload.position.x,
      options.payload.position.y,
      options.payload.position.z
    );

    this.#loopIntervalId = setInterval(() => {
      if (this.#sphere && this.#sphere.scaling.x < options.payload.radius) {
        this.#sphere.scaling.x += 2;
        this.#sphere.scaling.y += 2;
        this.#sphere.scaling.z += 2;
      }
    }, 30);

    this.#delayTimeoutId = setTimeout(() => {
      this.#startAction(
        gravitationalFieldOrigin,
        options.payload.radius - 2,
        options.payload.strength
      );
    }, 100);

    this.#durationTimeoutId = setTimeout(() => {
      this.dispose();
    }, 300);
  }

  #startAction(
    gravitationalFieldOrigin: Vector3,
    radius: number,
    strength: number
  ) {
    this.#event = this.#physicsHelper.applyRadialExplosionImpulse(
      gravitationalFieldOrigin,
      {
        radius: radius,
        strength: strength,
        falloff: PhysicsRadialImpulseFalloff.Linear,
      } as PhysicsRadialExplosionEventOptions
    );

    this.#sphere = this.#createSphere();
    this.#addMaterialToMesh(this.#sphere);
    this.#sphere.position = gravitationalFieldOrigin;
  }

  #addMaterialToMesh(sphere: any) {
    const sphereMaterial = new StandardMaterial('sphereMaterial', this.#scene);
    sphereMaterial.alpha = 0.2;
    sphereMaterial.disableLighting = true;
    sphere.material = sphereMaterial;
  }

  #createSphere() {
    return MeshBuilder.CreateSphere(`gravitation-action-${Math.random()}`, {
      segments: 32,
      diameter: 1,
      sideOrientation: Mesh.FRONTSIDE,
    });
  }

  public dispose() {
    if (this.#delayTimeoutId) {
      clearTimeout(this.#delayTimeoutId);
    }
    if (this.#durationTimeoutId) {
      clearTimeout(this.#durationTimeoutId);
    }
    if (this.#loopIntervalId) {
      clearInterval(this.#loopIntervalId);
    }
    this.#sphere?.dispose();
    this.#event?.dispose();
  }
}
