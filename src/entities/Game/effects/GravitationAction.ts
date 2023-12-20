import type { Scene } from '@babylonjs/core';
import {
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PhysicsBody,
  PhysicsHelper,
  PhysicsRadialImpulseFalloff,
  Texture,
  Vector3,
} from '@babylonjs/core';
import flareTexture from '@/shared/assets/flare.png';
import AbstractAction from '@/entities/Game/effects/AbstractAction';

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

type GravitationalField = ReturnType<
  typeof PhysicsHelper.prototype.gravitationalField
>;

// https://forum.babylonjs.com/t/safe-way-to-check-if-a-physicsbody-object-has-been-disposed-in-babylon-js/46512
function bodyIsDisposed(body: PhysicsBody | any) {
  return !!body._isDisposed;
}

export default class GravitationAction extends AbstractAction {
  private readonly physicsHelper: PhysicsHelper;
  private readonly payload: GravitationPayload;
  private readonly gravitationalPosition: Vector3;
  private readonly particleSystem: ParticleSystem;
  private readonly sphere: Mesh;
  private readonly event: GravitationalField;
  private readonly dumpingBodiesList: Set<PhysicsBody> = new Set();

  constructor(options: {
    physicsHelper: PhysicsHelper;
    scene: Scene;
    payload: GravitationPayload;
  }) {
    super({
      scene: options.scene,
      actionPrefix: 'action-gravitation',
      delayStartAction: 1,
      delayEndAction: options.payload.duration + 1,
      delayDisposeAction: options.payload.duration + 1001,
      intervalLoopAction: 30,
    });
    this.payload = options.payload;
    this.physicsHelper = options.physicsHelper;

    this.gravitationalPosition = new Vector3(
      options.payload.position.x,
      options.payload.position.y - 0.5,
      options.payload.position.z
    );

    this.sphere = MeshBuilder.CreateSphere(this.getEventName('sphere'), {
      segments: 32,
      diameter: this.payload.radius * 2 - 1,
      sideOrientation: Mesh.FRONTSIDE,
    });
    this.addDefaultMaterialToMesh(this.sphere);
    this.sphere.position = this.gravitationalPosition;

    this.event = this.physicsHelper.gravitationalField(
      this.gravitationalPosition,
      this.payload.radius,
      this.payload.strength,
      PhysicsRadialImpulseFalloff.Linear
    );

    this.event = this.physicsHelper.gravitationalField(
      this.gravitationalPosition,
      {
        radius: this.payload.radius,
        strength: this.payload.strength,
        falloff: PhysicsRadialImpulseFalloff.Linear,
        sphere: {
          segments: 32,
          diameter: this.payload.radius * 2,
        },
        affectedBodiesCallback: (bodiesWithData) => {
          for (const bodyWithData of bodiesWithData) {
            bodyWithData.body.setLinearDamping(1.7);
            this.dumpingBodiesList.add(bodyWithData.body);
          }

          for (const bodyWithData of this.dumpingBodiesList) {
            if (!bodiesWithData.find((b) => b.body === bodyWithData)) {
              this.dumpingBodiesList.delete(bodyWithData);
              if (bodyIsDisposed(bodyWithData)) {
                continue;
              }
              bodyWithData?.setLinearDamping(0);
            }
          }
        },
        affectedImpostorsCallback: () => {},
      }
    );

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
    particleSystem.emitter = this.gravitationalPosition;
    particleSystem.gravity = new Vector3(0, 10, 0);
    particleSystem.emitRate = 50;
    particleSystem.minEmitPower = -1;
    particleSystem.maxEmitPower = -2;
    particleSystem.createSphereEmitter(options.payload.radius, 0.1);
    particleSystem.start();
  }

  loopAction() {
    if (this.status === 'idle') {
      this.gravitationalPosition.y += 0.05;
      return;
    }

    if (this.status === 'started') {
      this.gravitationalPosition.y += 0.05;
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
    this.particleSystem.stop();
    this.event?.disable();
    this.dumpingBodiesList.forEach((body) => {
      if (bodyIsDisposed(body)) {
        return;
      }
      body.setLinearDamping(0);
    });
    this.dumpingBodiesList.clear();
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
