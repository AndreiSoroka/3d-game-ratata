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
} from 'babylonjs';
import flareTexture from '@/shared/assets/flare.png';

export default class MultiPlayer {
  readonly #scene: Scene;
  readonly #material: StandardMaterial;
  readonly #shadow: ShadowGenerator;
  public readonly playerMesh: Mesh;

  constructor(options: {
    scene: Scene;
    startPosition: Vector3;
    playerName?: string;
    shadow: ShadowGenerator;
  }) {
    const name = options.playerName ?? Math.random().toString(16);
    this.#scene = options.scene;
    this.#shadow = options.shadow;
    this.#material = this.#createMaterial();

    this.playerMesh = this.#createPlayerMesh(name);
    this.playerMesh.position = options.startPosition;
    this.playerMesh.material = this.#material;
    // new TrailMesh(
    //   `MultiPlayerTrail-${name}`,
    //   this.playerMesh,
    //   this.#scene,
    //   1,
    //   100,
    //   true
    // );

    this.#shadow.addShadowCaster(this.playerMesh);
    const particleSystem = new ParticleSystem('particles', 2000, this.#scene);
    particleSystem.particleTexture = new Texture(flareTexture, this.#scene);

    // Position where the particles are emiited from
    // const particleSystem = new ParticleSystem('particles', 2000, this.#scene);
    particleSystem.particleTexture = new Texture(flareTexture, this.#scene);
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
    const material = new StandardMaterial('material', this.#scene);
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
      this.#scene
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

    this.#scene.beginAnimation(this.playerMesh, 0, 30, false);
  }

  public dispose() {
    this.playerMesh.dispose();
    this.#material.dispose();
  }
}
