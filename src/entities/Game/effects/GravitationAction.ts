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

export type GravitationPayload = {
  radius: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  strength: number;
  duration: number;
};

export default class GravitationAction {
  readonly #scene: Scene;
  readonly #physicsHelper: PhysicsHelper;
  #sphere: Mesh | null = null;
  #event: ReturnType<typeof PhysicsHelper.prototype.gravitationalField> | null =
    null;

  #delayTimeoutId: number | null = null;
  #durationTimeoutId: number | null = null;
  #loopIntervalId: number | null = null;

  constructor(options: {
    physicsHelper: PhysicsHelper;
    scene: Scene;
    payload: GravitationPayload;
  }) {
    this.#scene = options.scene;
    this.#physicsHelper = options.physicsHelper;

    const gravitationalFieldOrigin = new Vector3(
      options.payload.position.x,
      options.payload.position.y,
      options.payload.position.z
    );
    gravitationalFieldOrigin.y -= options.payload.radius;

    this.#loopIntervalId = setInterval(() => {
      gravitationalFieldOrigin.y += 0.05;
    }, 30);

    this.#delayTimeoutId = setTimeout(() => {
      this.#startAction(
        gravitationalFieldOrigin,
        options.payload.radius,
        options.payload.strength
      );
    }, 1000);

    this.#durationTimeoutId = setTimeout(() => {
      this.dispose();
    }, options.payload.duration + 1000);
  }

  #startAction(
    gravitationalFieldOrigin: Vector3,
    radius: number,
    strength: number
  ) {
    this.#event = this.#physicsHelper.gravitationalField(
      gravitationalFieldOrigin,
      {
        radius: radius,
        strength: strength,
        falloff: PhysicsRadialImpulseFalloff.Linear,
      } as PhysicsRadialExplosionEventOptions
    );
    this.#event?.enable();

    this.#sphere = this.#createSphere(radius);
    this.#addMaterialToMesh(this.#sphere);
    this.#sphere.position = gravitationalFieldOrigin;
  }

  #addMaterialToMesh(sphere: any) {
    const sphereMaterial = new StandardMaterial('sphereMaterial', this.#scene);
    sphereMaterial.alpha = 0.2;
    sphereMaterial.disableLighting = true;
    sphere.material = sphereMaterial;
  }

  #createSphere(radius: number) {
    return MeshBuilder.CreateSphere(`gravitation-action-${Math.random()}`, {
      segments: 32,
      diameter: radius * 2 - 1,
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
    this.#event?.disable();
  }
}
