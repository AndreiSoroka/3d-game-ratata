import { ParticleSystem, type Scene, Texture } from '@babylonjs/core';
import {
  Mesh,
  MeshBuilder,
  PhysicsHelper,
  PhysicsRadialImpulseFalloff,
  PhysicsUpdraftMode,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import type { PhysicsRadialExplosionEventOptions } from '@babylonjs/core';
import AbstractAction from '@/entities/Game/effects/AbstractAction';
import flareTexture from '@/shared/assets/flare.png';

export type UpdraftPayload = {
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

type Updraft = ReturnType<typeof PhysicsHelper.prototype.updraft>;

export default class UpdraftAction extends AbstractAction {
  private readonly payload: UpdraftPayload;
  private readonly physicsHelper: PhysicsHelper;
  private readonly sphere: Mesh;
  private readonly event: Updraft;
  private readonly event2: Updraft;
  private readonly particleSystem: ParticleSystem;

  constructor(options: {
    physicsHelper: PhysicsHelper;
    scene: Scene;
    payload: UpdraftPayload;
  }) {
    super({
      scene: options.scene,
      actionPrefix: 'action-updraft',
      delayStartAction: 1000,
      delayEndAction: options.payload.duration + 1000,
      delayDisposeAction: options.payload.duration + 2000,
      intervalLoopAction: 30,
    });
    this.physicsHelper = options.physicsHelper;
    this.payload = options.payload;

    const actionPosition = new Vector3(
      options.payload.position.x,
      options.payload.position.y +
        options.payload.height / 2 -
        options.payload.height / 4,
      options.payload.position.z
    );

    const eventPosition = new Vector3(
      options.payload.position.x,
      options.payload.position.y - options.payload.height / 4,
      options.payload.position.z
    );

    this.event = this.physicsHelper.updraft(
      eventPosition,
      options.payload.radius,
      options.payload.strength / 2,
      options.payload.height,
      PhysicsUpdraftMode.Center
    );
    this.event2 = this.physicsHelper.updraft(
      eventPosition,
      options.payload.radius,
      options.payload.strength,
      options.payload.height,
      // PhysicsUpdraftMode.Center
      PhysicsUpdraftMode.Perpendicular
    );

    this.sphere = MeshBuilder.CreateCylinder(this.getEventName('cylinder'), {
      height: this.payload.height,
      diameter: this.payload.radius * 2,
    });
    this.addDefaultMaterialToMesh(this.sphere);
    this.sphere.position = actionPosition;

    const particleSystem = new ParticleSystem(
      this.getEventName('particles'),
      2000,
      this.scene
    );
    this.particleSystem = particleSystem;
    particleSystem.particleTexture = new Texture(flareTexture, this.scene);
    particleSystem.minSize = 0.2;
    particleSystem.maxSize = 0.7;
    particleSystem.maxLifeTime = 1;
    particleSystem.minLifeTime = 0;
    particleSystem.emitter = actionPosition;
    particleSystem.gravity = new Vector3(0, 10, 0);
    particleSystem.emitRate = 50;
    particleSystem.minEmitPower = -1;
    particleSystem.maxEmitPower = -4;
    particleSystem.createCylinderEmitter(
      options.payload.radius,
      options.payload.height,
      0.3
    );
    particleSystem.start();
  }

  loopAction() {
    if (this.status === 'started') {
      if (this.sphere.material && this.sphere.material.alpha < 0.1) {
        this.sphere.material.alpha += 0.02;
      }
      return;
    }
    if (this.status === 'ended') {
      if (this.sphere?.material) {
        this.sphere.material.alpha -= 0.01;
      }
    }
  }

  startAction() {
    this.event?.enable();
    this.event2?.enable();
  }

  endAction() {
    this.event?.disable();
    this.event2?.disable();
    this.particleSystem?.stop();
  }

  public dispose() {
    super.dispose();
    this.sphere?.dispose(false, true);
    this.event?.disable();
    this.event?.dispose();
    this.event2?.disable();
    this.event2?.dispose();
    this.particleSystem?.stop();
    this.particleSystem?.dispose(true);
  }
}
