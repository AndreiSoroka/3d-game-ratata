import {
  type IPhysicsCollisionEvent,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import sphereTexture from '@/shared/assets/sphere_bg.jpg';
import flareTexture from '@/shared/assets/flare.png';
import type { IBasePhysicsCollisionEvent } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import type { TypeOfMesh } from '@/entities/Game/envirement/utils/getTypeOfMesh';

export type MOVEMENT_DIRECTION =
  | 'FORWARD'
  | 'BACKWARD'
  | 'LEFT'
  | 'RIGHT'
  | 'JUMP';

const PLAYER_RADIUS = 1;
const PLAYER_RESTITUTION = 0.5;
const JUMP_IMPULSE = 15;

type CollisionInfo = {
  allowImmediateJump: boolean;
  correctPositionForJump: boolean;
};

export default class Player {
  private readonly _scene: Scene;
  private readonly _material: PBRMaterial;
  public playerPhysics: PhysicsAggregate | null = null;
  readonly #moveSpeed = 10;
  #collisionList = new Map<string, CollisionInfo>();
  private readonly _shadow: ShadowGenerator;

  public readonly playerMesh: Mesh;

  constructor(options: {
    scene: Scene;
    startPosition: Vector3;
    playerName?: string;
    shadow: ShadowGenerator;
  }) {
    this._scene = options.scene;
    this._shadow = options.shadow;
    this._material = this.#createMaterial();

    this.playerMesh = this.#createPlayerMesh(options.playerName);

    this.playerMesh.material = this._material;
    this.playerMesh.position = options.startPosition;
    this.playerMesh.applyFog = false;

    this._shadow.addShadowCaster(this.playerMesh);

    const particleSystem = new ParticleSystem('particles', 2000, this._scene);
    particleSystem.particleTexture = new Texture(flareTexture, this._scene);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.3;

    particleSystem.emitter = this.playerMesh;
    particleSystem.gravity = new Vector3(0, 1, 0);
    particleSystem.emitRate = 5;
    particleSystem.start();

    this._scene.whenReadyAsync().then(() => {
      this.playerPhysics = this.#createPlayerPhysics();

      // todo: detach the observable
      const observableStartCollision =
        this.playerPhysics.body.getCollisionObservable();
      const observableEndCollision =
        this.playerPhysics.body.getCollisionEndedObservable();
      if (!observableStartCollision || !observableEndCollision) {
        throw new Error('No collision observable');
      }
      observableStartCollision.add((collisionEvent) => {
        this.#onCollisionStart(collisionEvent);
      });
      observableEndCollision.add((collisionEvent) => {
        this.#onCollisionEnd(collisionEvent);
      });
    });
  }

  #createMaterial() {
    const material = new PBRMaterial('playerMaterial', this._scene);
    material.albedoTexture = new Texture(sphereTexture, this._scene);
    material.metallic = 0;
    material.maxSimultaneousLights = 10;
    return material;
  }

  #createPlayerMesh(name: string = 'PlayerSphere' + Math.random()) {
    return MeshBuilder.CreateSphere(
      name,
      {
        segments: 64,
        diameter: PLAYER_RADIUS * 2,
        sideOrientation: Mesh.FRONTSIDE,
      },
      this._scene
    );
  }

  #createPlayerPhysics() {
    const physicsAggregate = new PhysicsAggregate(
      this.playerMesh,
      PhysicsShapeType.SPHERE,
      {
        mass: 1,
        restitution: PLAYER_RESTITUTION,
        friction: 1,
      },
      this._scene
    );

    physicsAggregate.body.setAngularDamping(5);
    physicsAggregate.body.setCollisionCallbackEnabled(true);
    return physicsAggregate;
  }

  #getCollidedAgainstId(collisionEvent: IBasePhysicsCollisionEvent) {
    return collisionEvent.collidedAgainst.transformNode.id;
  }

  #onCollisionStart(collisionEvent: IPhysicsCollisionEvent) {
    // ignore collisions with objects that are not in the env
    if (
      collisionEvent.collidedAgainst.transformNode?.parent?.name !==
      ('environment' satisfies TypeOfMesh)
    ) {
      return;
    }
    const collidedObjectId = this.#getCollidedAgainstId(collisionEvent);

    // for jump: the object should not touch the side and top
    const touchYPosition =
      this.playerMesh.position.y -
      (collisionEvent.point?.y || this.playerMesh.position.y);
    const isCorrectPositionForJump = touchYPosition > PLAYER_RADIUS * 0.4;

    if (collisionEvent.type === 'COLLISION_STARTED') {
      const fallImpulse =
        (collisionEvent.normal?.y || 0) * -collisionEvent.impulse;

      this.#collisionList.set(collidedObjectId, {
        allowImmediateJump: fallImpulse < JUMP_IMPULSE / PLAYER_RESTITUTION,
        correctPositionForJump: isCorrectPositionForJump,
      });
    }

    if (collisionEvent.type === 'COLLISION_CONTINUED') {
      if (!this.#collisionList.has(collidedObjectId)) {
        this.#collisionList.set(collidedObjectId, {
          allowImmediateJump: true,
          correctPositionForJump: isCorrectPositionForJump,
        });
      }

      const collision = this.#collisionList.get(collidedObjectId);
      if (!collision) {
        throw new Error('No collision');
      }
      collision.correctPositionForJump = isCorrectPositionForJump;
    }
  }

  #onCollisionEnd(collisionEvent: IBasePhysicsCollisionEvent) {
    const collidedObjectId = this.#getCollidedAgainstId(collisionEvent);
    this.#collisionList.delete(collidedObjectId);
  }

  public move(cameraViewAngle: number, directions: Set<MOVEMENT_DIRECTION>) {
    if (directions.size === 0) {
      return;
    }
    if (!this.playerPhysics) {
      return;
    }

    if (directions.has('JUMP')) {
      this.jump();
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
    this.playerPhysics.body.setAngularVelocity(
      directionVector.scale(this.#moveSpeed)
    );
  }

  public jump() {
    if (!this.#collisionList.size || !this.playerPhysics) {
      return;
    }
    const allowJump = Array.from(this.#collisionList.values()).every(
      (collision) =>
        collision.allowImmediateJump && collision.correctPositionForJump
    );
    if (!allowJump) {
      return;
    }
    // remove y velocity
    const linearVelocity = this.playerPhysics.body.getLinearVelocity();
    this.playerPhysics.body.setLinearVelocity(
      new Vector3(linearVelocity.x, 0, linearVelocity.z)
    );
    // apply impulse
    this.playerPhysics.body.applyImpulse(
      new Vector3(0, JUMP_IMPULSE, 0),
      this.playerMesh.getAbsolutePosition()
    );
  }

  public forwardImpulse(cameraViewAngle: number) {
    if (!this.playerPhysics) {
      return;
    }
    const x = -Math.cos(cameraViewAngle);
    const z = -Math.sin(cameraViewAngle);
    const directionVector = new Vector3(x, 0, z);
    directionVector.normalize();
    this.playerPhysics.body.applyImpulse(
      directionVector.scale(20),
      this.playerMesh.getAbsolutePosition()
    );
  }

  public dispose() {
    this._shadow.removeShadowCaster(this.playerMesh);
    this.playerPhysics?.dispose();
    this.playerMesh.dispose();
    this._material.dispose();
  }
}
