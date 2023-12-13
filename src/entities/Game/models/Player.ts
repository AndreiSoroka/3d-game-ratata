import {
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  Vector3,
} from 'babylonjs';
import sphereTexture from '@/shared/assets/sphere_bg.jpg';
import type { PhysicsEventType } from 'babylonjs/Physics/v2/IPhysicsEnginePlugin';
import flareTexture from '@/shared/assets/flare.png';

export type MOVEMENT_DIRECTION = 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT';

export default class Player {
  readonly #scene: Scene;
  readonly #material: StandardMaterial;
  #playerPhysics: PhysicsAggregate | null = null;
  readonly #moveSpeed = 10;
  #isColliding = false;
  #collisionList = new Set<string>();
  #shadow: ShadowGenerator;

  public readonly playerMesh: Mesh;

  constructor(options: {
    scene: Scene;
    startPosition: Vector3;
    playerName?: string;
    shadow: ShadowGenerator;
  }) {
    this.#scene = options.scene;
    this.#shadow = options.shadow;
    this.#material = this.#createMaterial();

    this.playerMesh = this.#createPlayerMesh(options.playerName);

    this.playerMesh.material = this.#material;
    this.playerMesh.position = options.startPosition;

    this.#shadow.addShadowCaster(this.playerMesh);

    const particleSystem = new ParticleSystem('particles', 2000, this.#scene);
    particleSystem.particleTexture = new Texture(flareTexture, this.#scene);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.3;

    particleSystem.emitter = this.playerMesh;
    particleSystem.gravity = new Vector3(0, 1, 0);
    particleSystem.emitRate = 5;
    particleSystem.start();

    this.#scene.whenReadyAsync().then(() => {
      this.#playerPhysics = this.#createPlayerPhysics();

      const observableStartCollision =
        this.#playerPhysics.body.getCollisionObservable();
      const observableEndCollision =
        this.#playerPhysics.body.getCollisionEndedObservable();
      if (!observableStartCollision || !observableEndCollision) {
        throw new Error('No collision observable');
      }
      observableStartCollision.add((collisionEvent) => {
        this.#onCollision(
          collisionEvent.type,
          collisionEvent.collidedAgainst.transformNode.id
        );
      });
      observableEndCollision.add((collisionEvent) => {
        this.#onCollision(
          collisionEvent.type,
          collisionEvent.collidedAgainst.transformNode.id
        );
      });
    });
  }

  #createMaterial() {
    const material = new StandardMaterial('material', this.#scene);
    material.emissiveTexture = new Texture(sphereTexture, this.#scene);
    material.maxSimultaneousLights = 10;
    return material;
  }

  #createPlayerMesh(name: string = 'PlayerSphere' + Math.random()) {
    return MeshBuilder.CreateSphere(
      name,
      {
        segments: 32,
        diameter: 2,
        sideOrientation: Mesh.FRONTSIDE,
      },
      this.#scene
    );
  }

  #createPlayerPhysics() {
    const physicsAggregate = new PhysicsAggregate(
      this.playerMesh,
      PhysicsShapeType.SPHERE,
      {
        mass: 1,
        restitution: 0.5,
        friction: 1,
      },
      this.#scene
    );

    physicsAggregate.body.setAngularDamping(5);
    physicsAggregate.body.setCollisionCallbackEnabled(true);
    return physicsAggregate;
  }

  #onCollision(collisionType: PhysicsEventType, collidedObjectId: string) {
    // if (!collidedObjectId.startsWith('ground')) {
    //   return;
    // }
    if (
      collisionType === 'COLLISION_STARTED' ||
      collisionType === 'COLLISION_CONTINUED'
    ) {
      this.#collisionList.add(collidedObjectId);
    }
    if (collisionType === 'COLLISION_FINISHED') {
      this.#collisionList.delete(collidedObjectId);
    }
    this.#isColliding = this.#collisionList.size > 0;
  }

  public move(cameraViewAngle: number, directions: Set<MOVEMENT_DIRECTION>) {
    if (directions.size === 0) {
      return;
    }
    if (!this.#playerPhysics) {
      return;
    }

    let x = 0;
    let z = 0;
    if (directions.has('FORWARD')) {
      x += Math.sin(cameraViewAngle);
      z += Math.cos(cameraViewAngle);
    }
    if (directions.has('BACKWARD')) {
      x -= Math.sin(cameraViewAngle);
      z -= Math.cos(cameraViewAngle);
    }
    if (directions.has('LEFT')) {
      x -= Math.cos(cameraViewAngle);
      z += Math.sin(cameraViewAngle);
    }
    if (directions.has('RIGHT')) {
      x += Math.cos(cameraViewAngle);
      z -= Math.sin(cameraViewAngle);
    }
    const directionVector = new Vector3(x, 0, z);

    directionVector.normalize();
    this.#playerPhysics.body.setAngularVelocity(
      directionVector.scale(this.#moveSpeed)
    );
  }

  public jump() {
    if (!this.#isColliding || !this.#playerPhysics) {
      return;
    }
    // remove y velocity
    const linearVelocity = this.#playerPhysics.body.getLinearVelocity();
    this.#playerPhysics.body.setLinearVelocity(
      new Vector3(linearVelocity.x, 0, linearVelocity.z)
    );
    // apply impulse
    this.#playerPhysics.body.applyImpulse(
      new Vector3(0, 15, 0),
      this.playerMesh.getAbsolutePosition()
    );
  }

  public dispose() {
    this.#playerPhysics?.dispose();
    this.playerMesh.dispose();
    this.#material.dispose();
  }
}
