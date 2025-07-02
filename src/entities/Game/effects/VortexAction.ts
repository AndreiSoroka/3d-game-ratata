import { ParticleSystem, type Scene, Texture } from '@babylonjs/core';
import { Mesh, MeshBuilder, PhysicsHelper, Vector3 } from '@babylonjs/core';
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
type VortexInLoopFn = (vortex: Mesh) => void;

export default class VortexAction extends AbstractAction {
  private readonly _payload: VortexPayload;
  private readonly _object: Mesh;
  private readonly _physicsHelper: PhysicsHelper;
  private readonly _event: Vortex;
  private readonly _particleSystem: ParticleSystem;
  private readonly _vortexInLoopFn: VortexInLoopFn;

  constructor(options: {
    physicsHelper: PhysicsHelper;
    scene: Scene;
    payload: VortexPayload;
    vortexInLoopFn: VortexInLoopFn;
  }) {
    super({
      scene: options.scene,
      actionPrefix: 'action-vortex',
      delayStartAction: 1000,
      delayEndAction: options.payload.duration + 1000,
      delayDisposeAction: options.payload.duration + 2000,
      intervalLoopAction: 30,
    });
    this._vortexInLoopFn = options.vortexInLoopFn;
    this._payload = options.payload;

    this._physicsHelper = options.physicsHelper;

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

    this._event = this._physicsHelper.vortex(
      eventPosition,
      options.payload.radius,
      options.payload.strength,
      options.payload.height
    );

    this._object = MeshBuilder.CreateCylinder(this.getEventName('sphere'), {
      height: this._payload.height,
      diameter: this._payload.radius * 2,
    });
    this._object.position = actionPosition;
    this.addDefaultMaterialToMesh(this._object);

    const particleSystem = new ParticleSystem(
      this.getEventName('particles'),
      2000,
      this.scene
    );
    this._particleSystem = particleSystem;
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
      if (this._object.material && this._object.material.alpha < 0.1) {
        this._object.material.alpha += 0.02;
      }
      this._vortexInLoopFn(this._object);
      return;
    }
    if (this.status === 'ended') {
      if (this._object?.material) {
        this._object.material.alpha -= 0.01;
      }
    }
  }

  startAction() {
    this._event?.enable();
  }

  endAction() {
    this._event?.disable();
    this._particleSystem.stop();
  }

  public dispose() {
    super.dispose();
    this._object.dispose(false, true);
    this._event?.disable();
    this._event?.dispose(true);
    this._particleSystem.stop();
    this._particleSystem.dispose(true);
  }
}
