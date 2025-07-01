import {
  Color3,
  Color4,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
  ParticleSystem,
  Texture,
} from '@babylonjs/core';
import flareTexture from '@/shared/assets/flare.png';
import { DAY_DURATION } from '../model/dayNightStore';

const CHECKPOINT_RADIUS = 2;

interface ICheckPointService {}

export class CheckPointService implements ICheckPointService {
  private readonly _scene: Scene;
  private readonly _position: Vector3;
  private readonly _material: StandardMaterial;
  private readonly _dayDuration: number = DAY_DURATION;
  private readonly _twilight = 0.2;
  private readonly _minAlpha = 0.01;
  private readonly _maxAlpha = 0.3;
  private _baseAlpha = 0.1;
  private _burstParticles: ParticleSystem | null = null;
  private _idleParticles: ParticleSystem | null = null;
  readonly mesh: Mesh;

  constructor(options: { scene: Scene; position: Vector3 }) {
    this._scene = options.scene;
    this._position = options.position;
    this._material = this._createMaterial();
    this.mesh = this._createPlayerMesh();
    this.mesh.material = this._material;
    this.mesh.position = this._position;
    this.mesh.receiveShadows = true;
    this._baseAlpha = this._material.alpha;
  }

  setTime(time: number) {
    this._baseAlpha = this._calculateAlpha(time);
    this._changeAlpha(this._baseAlpha);
  }

  private _calculateAlpha(time: number) {
    const angle =
      ((time % this._dayDuration) / this._dayDuration) * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    const nightStrength = Math.min(
      Math.max((-sunHeight + this._twilight) / (1 + this._twilight), 0),
      1
    );
    return this._minAlpha + (this._maxAlpha - this._minAlpha) * nightStrength;
  }

  private _changeAlpha(value: number) {
    this._material.alpha = value;
  }

  _createMaterial() {
    const material = new StandardMaterial('CheckPointMaterial', this._scene);
    material.diffuseColor = Color3.FromHexString('#FF0000');
    material.emissiveColor = Color3.FromHexString('#438dc3');

    material.maxSimultaneousLights = 10;
    material.alpha = 0.1;
    return material;
  }

  _createPlayerMesh(name: string = 'CheckPoint' + Math.random()) {
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

  private _createIdleParticles() {
    const ps = new ParticleSystem('checkpointIdle', 200, this._scene);
    ps.particleTexture = new Texture(flareTexture, this._scene);
    ps.minSize = 0.05;
    ps.maxSize = 0.2;
    ps.emitter = this.mesh;
    ps.gravity = new Vector3(0, 1, 0);
    // @TODO: Color like in _createBurstParticles, you can create a constant for it
    ps.emitRate = 3;
    return ps;
  }

  private _createBurstParticles() {
    const ps = new ParticleSystem('checkpointBurst', 100, this._scene);
    ps.particleTexture = new Texture(flareTexture, this._scene);
    ps.minSize = 0.2;
    ps.maxSize = 0.6;
    ps.minLifeTime = 0.2;
    ps.maxLifeTime = 0.8;
    ps.emitter = this.mesh;
    ps.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    // Emit from the checkpoint surface so the burst surrounds it
    ps.createSphereEmitter(CHECKPOINT_RADIUS, 0);
    ps.minEmitPower = 3;
    ps.maxEmitPower = 6;
    ps.color1 = new Color4(0.5, 0.5, 1, 1);
    ps.color2 = new Color4(0.2, 0.8, 1, 1);
    // Stronger upward gravity for a more energetic effect
    ps.gravity = new Vector3(0, 8, 0);
    ps.emitRate = 80;
    ps.targetStopDuration = 0.6;
    return ps;
  }

  /** Trigger a burst of particles regardless of activation state. */
  burst() {
    // @TODO: Should activate with first touch. And when animation is ready, we can activate again.
    this._burstParticles?.stop();
    this._burstParticles?.dispose();
    this._burstParticles = this._createBurstParticles();
    this._burstParticles.start();
  }

  /**
   * Start the idle particle effect. Creates the system on first activation.
   */
  activate() {
    if (!this._idleParticles) {
      this._idleParticles = this._createIdleParticles();
    }
    this._idleParticles.start();
  }

  deactivate() {
    this._idleParticles?.stop();
    this._idleParticles?.dispose();
    this._idleParticles = null;
  }

  // Checkpoints no longer blink when activated; they simply emit particles.

  dispose() {
    // @TODO dispose particles and some other resources
  }
}
