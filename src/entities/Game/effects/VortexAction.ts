import { ParticleSystem, type Scene, Texture } from '@babylonjs/core';
import {
  Mesh,
  MeshBuilder,
  PhysicsHelper,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import type { PhysicsRadialExplosionEventOptions } from '@babylonjs/core';
import AbstractAction from '@/entities/Game/effects/AbstractAction';
import flareTexture from '@/shared/assets/flare.png';

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

type Vortex = ReturnType<typeof PhysicsHelper.prototype.vortex>;

export default class VortexAction extends AbstractAction {
  private readonly payload: VortexPayload;
  private readonly sphere: Mesh;
  private readonly physicsHelper: PhysicsHelper;
  private readonly event: Vortex;
  private readonly particleSystem: ParticleSystem;

  constructor(options: {
    physicsHelper: PhysicsHelper;
    scene: Scene;
    payload: VortexPayload;
  }) {
    super({
      scene: options.scene,
      actionPrefix: 'action-vortex',
      delayStartAction: 1000,
      delayEndAction: options.payload.duration + 1000,
      delayDisposeAction: options.payload.duration + 2000,
      intervalLoopAction: 30,
    });
    this.payload = options.payload;

    this.physicsHelper = options.physicsHelper;

    const actionPosition = new Vector3(
      options.payload.position.x,
      options.payload.position.y,
      options.payload.position.z
    );
    const eventPosition = new Vector3(
      options.payload.position.x,
      options.payload.position.y - options.payload.height / 2,
      options.payload.position.z
    );

    this.event = this.physicsHelper.vortex(
      eventPosition,
      options.payload.radius,
      options.payload.strength,
      options.payload.height
    );

    this.sphere = MeshBuilder.CreateCylinder(this.getEventName('sphere'), {
      height: this.payload.height,
      diameter: this.payload.radius * 2,
    });
    this.sphere.position = actionPosition;
    this.addDefaultMaterialToMesh(this.sphere);

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
    particleSystem.gravity = new Vector3(0, 3, 0);
    particleSystem.emitRate = 150;
    particleSystem.minEmitPower = 0;
    particleSystem.maxEmitPower = 0;
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
  }

  endAction() {
    this.event?.disable();
    this.particleSystem.stop();
  }

  public dispose() {
    super.dispose();
    this.sphere.dispose();
    this.event?.disable();
    this.event?.dispose();
    this.particleSystem.stop();
    this.particleSystem.dispose();
  }
}
