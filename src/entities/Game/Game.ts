import PlayerCamera from '@/entities/Game/models/PlayerCamera';
import groundTexture from '@/shared/assets/ground_bg.png';
import {
  Color3,
  CubeTexture,
  DirectionalLight,
  Engine,
  HavokPlugin,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsHelper,
  PhysicsShapeType,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import { type HavokPhysicsWithBindings } from '@babylonjs/havok';
import Player, { type MOVEMENT_DIRECTION } from '@/entities/Game/models/Player';
import MultiPlayer from '@/entities/Game/models/MultiPlayer';
import GravitationAction, {
  type GravitationPayload,
} from '@/entities/Game/effects/GravitationAction';
import { interval, Subject, throttle } from 'rxjs';

import '@babylonjs/loaders';
import loadEnvironment from '@/entities/Game/envirement/loadEnvironment';
import {
  startGravitationLevel,
  upGravitationLevel,
} from '@/entities/Game/effects/getGravitationLevel';
import {
  startRadialExplosionLevel,
  upRadialExplosionLevel,
} from '@/entities/Game/effects/getRadialExplosionLevel';
import RadialExplosionAction, {
  type RadialExplosionPayload,
} from '@/entities/Game/effects/RadialExplosionAction';

export type CAMERA_DIRECTION = 'CAMERA_LEFT' | 'CAMERA_RIGHT';
export type DIRECTION = MOVEMENT_DIRECTION | CAMERA_DIRECTION;
export type PLAYER_ACTION =
  | 'JUMP'
  | 'ACTION1'
  | 'ACTION2'
  | 'ACTION3'
  | 'ACTION4';

export type MultiPlayerActionGravitation = {
  name: 'GRAVITATION';
  payload: GravitationPayload;
};
export type MultiPlayerActionRadialExplosion = {
  name: 'RADIAL_EXPLOSION';
  payload: RadialExplosionPayload;
};
export type MultiPlayerActions =
  | MultiPlayerActionGravitation
  | MultiPlayerActionRadialExplosion;

export default class Game {
  #canvas: HTMLCanvasElement;
  #player!: Player;
  #engine: Engine;
  #scene: Scene;
  #cameraAngle = 0;
  playerCamera: PlayerCamera;
  #havokInstance: HavokPhysicsWithBindings;
  #shadow: ShadowGenerator;
  #movementDirection: Set<MOVEMENT_DIRECTION> = new Set([]);
  #cameraDirection: Set<CAMERA_DIRECTION> = new Set([]);
  #physicsHelper: PhysicsHelper | null = null;

  #skillGravitation = startGravitationLevel;
  #skillRadialExplosion = startRadialExplosionLevel;

  public multiplayerSubject$ = new Subject<MultiPlayerActions>();

  #playerPositionSubject = new Subject<{
    x: number;
    y: number;
    z: number;
  }>();

  public playerPositionSubject$ = this.#playerPositionSubject
    .asObservable()
    .pipe(throttle(() => interval(100)));

  #multiplayers: Record<string, MultiPlayer> = {};

  constructor(
    canvas: HTMLCanvasElement,
    havokInstance: HavokPhysicsWithBindings
  ) {
    this.#canvas = canvas;
    this.#engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    this.#havokInstance = havokInstance;
    this.#scene = this.#createScene();
    this.#physicsHelper = new PhysicsHelper(this.#scene);

    if (document.location.hash === '#debug') {
      this.#scene.debugLayer
        .show({
          embedMode: true,
          showExplorer: true,
          showInspector: true,
        })
        .then(() => {
          const $el = window.document.getElementById('embed-host');
          if (!$el) {
            return;
          }
          $el.style.maxHeight = '100vh';
        });
    }
    // const pointLight = new PointLight(
    //   'pointLight',
    //   new Vector3(0, 30, 10),
    //   this.#scene
    // );
    // pointLight.intensity = 1;
    const light = new DirectionalLight(
      'dirLight',
      new Vector3(-1, -2, -1),
      this.#scene
    );
    light.specular = new Color3(0, 0, 0);
    light.intensity = 0.3;

    light.position = new Vector3(20, 40, 20);
    this.#shadow = new ShadowGenerator(2024, light);
    this.#shadow.blurBoxOffset = 4;
    this.#shadow.forceBackFacesOnly = true;
    this.#shadow.useBlurExponentialShadowMap = true;

    loadEnvironment(this.#scene, this.#shadow).then(() => {});
    this.playerCamera = new PlayerCamera(this.#scene);
    // this.generalLight = new GeneralLight(this.#scene);
    this.initNewPlayer();

    this.#engine.runRenderLoop(this.#loop.bind(this));
    // this.#createGround();

    // const envTexture = new CubeTexture(
    //   'https://playground.babylonjs.com/textures/SpecularHDR.dds',
    //   this.#scene
    // );
    // this.#scene.createDefaultSkybox(envTexture, true, 1000);

    this.#scene.fogMode = Scene.FOGMODE_LINEAR;
    this.#scene.fogStart = 30.0;
    this.#scene.fogEnd = 70.0;

    this.#scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
      'https://playground.babylonjs.com/textures/environment.env',
      this.#scene
    );
  }

  onBeforeRenderObservable() {
    this.#playerPositionSubject.next({
      x: this.#player.playerMesh.position.x,
      y: this.#player.playerMesh.position.y,
      z: this.#player.playerMesh.position.z,
    });

    if (this.#player.playerMesh.position.y < -2) {
      this.initNewPlayer();
    }
  }

  initNewPlayer() {
    this.#player?.dispose();
    this.#skillGravitation = startGravitationLevel;
    this.#skillRadialExplosion = startRadialExplosionLevel;

    this.#player = new Player({
      scene: this.#scene,
      startPosition: new Vector3(0, 30, 0),
      shadow: this.#shadow,
    });
    this.playerCamera.setTarget(this.#player.playerMesh);

    this.#player.playerMesh.onBeforeRenderObservable.add(
      this.onBeforeRenderObservable.bind(this)
    );
  }

  #createScene() {
    const gravityVector = new Vector3(0, -20, 0);
    const physicsPlugin = new HavokPlugin(true, this.#havokInstance);

    const scene = new Scene(this.#engine);

    // scene.ambientColor = new Color3(0, 0, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);

    return scene;
  }

  #createGround() {
    // Create a built-in "ground" shape;
    const ground = MeshBuilder.CreateGround(
      'ground1',
      {
        width: 100,
        height: 100,
        subdivisions: 2,
        updatable: false,
      },
      this.#scene
    );
    const material = new StandardMaterial('material', this.#scene);
    material.emissiveTexture = new Texture(groundTexture, this.#scene);
    material.diffuseColor = new Color3(0.1, 0.5, 0.5);
    ground.material = material;
    ground.receiveShadows = true;
    new PhysicsAggregate(
      ground,
      PhysicsShapeType.BOX,
      { mass: 0, friction: 1 },
      this.#scene
    );
    // Return the created scene
  }

  #loop() {
    this.#handleChangeCameraAngle();
    // move player
    this.#player.move(-this.#cameraAngle, this.#movementDirection);
    // rotate camera
    this.playerCamera.setAngle(this.#cameraAngle);
    // render scene
    this.#scene.render();
  }

  #handleChangeCameraAngle() {
    // convert milliseconds to seconds
    const deltaTime = this.#scene.deltaTime / 1000;
    // angle in degrees per second
    const rotationSpeed = 2;

    if (this.#cameraDirection.has('CAMERA_LEFT')) {
      this.#cameraAngle += rotationSpeed * deltaTime;
    }
    if (this.#cameraDirection.has('CAMERA_RIGHT')) {
      this.#cameraAngle -= rotationSpeed * deltaTime;
    }
  }

  public resize() {
    this.#engine.resize();
  }

  public setMultiPlayerPosition(
    id: string,
    position: {
      x: number;
      y: number;
      z: number;
    }
  ) {
    // console.log('setMultiPlayerPosition', id, position);
    const Vector3Position = new Vector3(position.x, position.y, position.z);
    if (!this.#multiplayers[id]) {
      this.#multiplayers[id] = new MultiPlayer({
        scene: this.#scene,
        startPosition: Vector3Position,
        shadow: this.#shadow,
      });
    }
    this.#multiplayers[id].setPosition(Vector3Position);
  }

  public callWordAction(data: MultiPlayerActions) {
    if (data.name === 'RADIAL_EXPLOSION') {
      this.#callRadialExplosionAction(data.payload);
    }
    if (data.name === 'GRAVITATION') {
      this.#callGravitationAction(data.payload);
    }
  }

  public setPlayerDirection(direction: DIRECTION, isPressed: boolean) {
    // todo refactor
    if (direction === 'CAMERA_LEFT' || direction === 'CAMERA_RIGHT') {
      if (isPressed) {
        this.#cameraDirection.add(direction);
      } else {
        this.#cameraDirection.delete(direction);
      }
      return;
    }
    if (isPressed) {
      this.#movementDirection.add(direction);
    } else {
      this.#movementDirection.delete(direction);
    }
  }

  callPlayerAction(action: PLAYER_ACTION) {
    switch (action) {
      case 'JUMP':
        this.#player.jump();
        break;
      case 'ACTION1':
        this.#callPlayerGravitationAction();
        break;
      case 'ACTION2':
        this.#callPlayerRadialExplosionAction();
        break;
      case 'ACTION3':
        break;
      case 'ACTION4':
        break;
    }
  }

  #callPlayerGravitationAction() {
    const gravitationLevel = this.#skillGravitation;

    this.#skillGravitation = upGravitationLevel(gravitationLevel);

    const playerPosition = this.#player.playerMesh.getAbsolutePosition();
    const { maxRandomPosition } = gravitationLevel;
    const x =
      playerPosition.x +
      Math.random() * maxRandomPosition -
      maxRandomPosition / 2;
    const y =
      playerPosition.y +
      Math.random() * maxRandomPosition -
      maxRandomPosition / 2;
    const z =
      playerPosition.z +
      Math.random() * maxRandomPosition -
      maxRandomPosition / 2;

    const payload: GravitationPayload = {
      radius: gravitationLevel.radius,
      strength: gravitationLevel.strength,
      position: {
        x,
        y,
        z,
      },
      duration: gravitationLevel.duration,
    };

    this.multiplayerSubject$.next({
      name: 'GRAVITATION',
      payload,
    });
    this.#callGravitationAction(payload);
  }

  #callGravitationAction(payload: GravitationPayload) {
    // todo dispose
    if (!this.#physicsHelper) {
      return;
    }
    new GravitationAction({
      physicsHelper: this.#physicsHelper,
      scene: this.#scene,
      payload,
    });
  }

  #callPlayerRadialExplosionAction() {
    const radialExplosionLevel = this.#skillRadialExplosion;

    this.#skillRadialExplosion = upRadialExplosionLevel(radialExplosionLevel);
    console.log('radialExplosionLevel', radialExplosionLevel);

    const playerPosition = this.#player.playerMesh.getAbsolutePosition();
    const { maxRandomPosition } = radialExplosionLevel;
    const x =
      playerPosition.x +
      (Math.random() * maxRandomPosition) / maxRandomPosition / 2;
    const y =
      playerPosition.y +
      (Math.random() * maxRandomPosition) / maxRandomPosition / 2;
    const z =
      playerPosition.z +
      (Math.random() * maxRandomPosition) / maxRandomPosition / 2;
    const payload: RadialExplosionPayload = {
      radius: radialExplosionLevel.radius,
      strength: radialExplosionLevel.strength,
      position: {
        x,
        y,
        z,
      },
    };
    this.multiplayerSubject$.next({
      name: 'RADIAL_EXPLOSION',
      payload,
    });
    this.#callRadialExplosionAction(payload);
  }

  #callRadialExplosionAction(payload: RadialExplosionPayload) {
    // todo dispose
    if (!this.#physicsHelper) {
      return;
    }
    new RadialExplosionAction({
      physicsHelper: this.#physicsHelper,
      scene: this.#scene,
      payload,
    });
  }

  public dispose() {
    this.#engine.stopRenderLoop();
    this.#scene.dispose();
  }
}
