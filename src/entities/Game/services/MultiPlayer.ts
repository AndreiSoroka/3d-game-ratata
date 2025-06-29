import {
  Animation,
  Color3,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import flareTexture from '@/shared/assets/flare.png';

export default class MultiPlayer {
  private readonly _scene: Scene;
  private readonly _material: StandardMaterial;
  private readonly _shadow: ShadowGenerator;
  public readonly playerMesh: Mesh;

  constructor(options: {
    scene: Scene;
    startPosition: Vector3;
    playerName?: string;
    shadow: ShadowGenerator;
  }) {
    const name = options.playerName ?? Math.random().toString(16);
    this._scene = options.scene;
    this._shadow = options.shadow;
    this._material = this.#createMaterial();

    this.playerMesh = this.#createPlayerMesh(name);
    this.playerMesh.position = options.startPosition;
    this.playerMesh.material = this._material;
    // new TrailMesh(
    //   `MultiPlayerTrail-${name}`,
    //   this.playerMesh,
    //   this._scene,
    //   1,
    //   100,
    //   true
    // );

    this._shadow.addShadowCaster(this.playerMesh);
    const particleSystem = new ParticleSystem('particles', 2000, this._scene);
    particleSystem.particleTexture = new Texture(flareTexture, this._scene);

    // Position where the particles are emiited from
    // const particleSystem = new ParticleSystem('particles', 2000, this._scene);
    particleSystem.particleTexture = new Texture(flareTexture, this._scene);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 1;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.minLifeTime = 0;
    //
    // particleSystem.emitter = this.playerMesh;
    particleSystem.emitter = this.playerMesh;
    particleSystem.gravity = new Vector3(0, 1, 0);
    particleSystem.emitRate = 10;
    // particleSystem.start();
    // particleSystem.color1 = new Color4(0.1, 0.1, 0.1);
    // particleSystem.color2 = new Color4(0, 0, 0);
    particleSystem.start();
  }

  #createMaterial() {
    const material = new StandardMaterial('material', this._scene);
    material.diffuseColor = new Color3(0, 0, 0);
    material.alpha = 0.2;
    return material;
  }

  #createPlayerMesh(name: string) {
    return MeshBuilder.CreateSphere(
      `MultiPlayerMesh-${name}`,
      {
        segments: 32,
        diameter: 2,
        sideOrientation: Mesh.FRONTSIDE,
      },
      this._scene
    );
  }

  public setPosition(newPosition: Vector3) {
    const animation = new Animation(
      'smoothMove',
      'position',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keys = [];
    keys.push({ frame: 0, value: this.playerMesh.position });
    keys.push({ frame: 3, value: newPosition });
    animation.setKeys(keys);

    this.playerMesh.animations = [];
    this.playerMesh.animations.push(animation);

    this._scene.beginAnimation(this.playerMesh, 0, 30, false);
  }

  public dispose() {
    this.playerMesh.dispose();
    this._material.dispose();
  }
}
