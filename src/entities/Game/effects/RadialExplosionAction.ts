import type { Scene } from '@babylonjs/core';
import {
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PhysicsHelper,
  PhysicsRadialImpulseFalloff,
  Texture,
  Vector3,
} from '@babylonjs/core';
import AbstractAction from '@/entities/Game/effects/AbstractAction';
import flareTexture from '@/shared/assets/flare.png';

export type RadialExplosionPayload = {
  radius: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  strength: number;
};

type ApplyRadialExplosionImpulse = ReturnType<
  typeof PhysicsHelper.prototype.applyRadialExplosionImpulse
>;

export default class RadialExplosionAction extends AbstractAction {
  private readonly payload: RadialExplosionPayload;
  private readonly sphere: Mesh;
  private readonly actionPosition: Vector3;
  private readonly physicsHelper: PhysicsHelper;
  private readonly particleSystem: ParticleSystem;
  private event: ApplyRadialExplosionImpulse | null = null;

  constructor(options: {
    physicsHelper: PhysicsHelper;
    scene: Scene;
    payload: RadialExplosionPayload;
  }) {
    super({
      scene: options.scene,
      actionPrefix: 'action-radial-explosion',
      delayStartAction: 500,
      delayEndAction: 800,
      delayDisposeAction: 4000,
      intervalLoopAction: 30,
    });
    this.payload = options.payload;
    this.physicsHelper = options.physicsHelper;

    this.actionPosition = new Vector3(
      options.payload.position.x,
      options.payload.position.y - 0.3,
      options.payload.position.z
    );

    this.sphere = MeshBuilder.CreateSphere(this.getEventName('sphere'), {
      segments: 32,
      diameter: 1,
      sideOrientation: Mesh.FRONTSIDE,
    });
    this.sphere.position = this.actionPosition;
    this.addDefaultMaterialToMesh(this.sphere);

    const particleSystem = new ParticleSystem(
      this.getEventName('particles'),
      2000,
      this.scene
    );
    this.particleSystem = particleSystem;
    particleSystem.particleTexture = new Texture(flareTexture, this.scene);
    particleSystem.minSize = 0.2;
    particleSystem.maxSize = 0.3;
    particleSystem.maxLifeTime = 0.3;
    particleSystem.minLifeTime = 0.1;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.emitter = this.actionPosition;
    particleSystem.gravity = new Vector3(0, -1, 0);
    particleSystem.emitRate = 300;
    particleSystem.createSphereEmitter(options.payload.radius, 0);
    particleSystem.maxEmitPower = -4;

    particleSystem.start();
  }

  loopAction() {
    if (this.status === 'started') {
      if (this.sphere.material && this.sphere.material.alpha < 0.1) {
        this.sphere.material.alpha = Math.min(
          this.sphere.material.alpha + 0.035,
          0.1
        );
      }
    }
    if (this.status === 'ended' && this.sphere.material) {
      this.sphere.material.alpha -= 0.01;
    }
    if (
      ['started', 'ended'].includes(this.status) &&
      this.sphere.scaling.x < this.payload.radius * 2
    ) {
      this.sphere.scaling.x += 2;
      this.sphere.scaling.y += 2;
      this.sphere.scaling.z += 2;
    }
  }

  endAction() {
    this.particleSystem.stop();
  }

  startAction() {
    this.event = this.physicsHelper.applyRadialExplosionImpulse(
      this.actionPosition,
      this.payload.radius,
      this.payload.strength,
      PhysicsRadialImpulseFalloff.Linear
    );
    this.particleSystem.stop();
  }

  public dispose() {
    super.dispose();
    this.sphere.dispose(false, true);
    this.event?.dispose();
    this.particleSystem.stop();
    this.particleSystem.dispose(true);
  }
}
