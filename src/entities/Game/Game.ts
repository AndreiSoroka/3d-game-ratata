import PlayerCamera from '@/entities/Game/services/PlayerCamera';
// import groundTexture from '@/shared/assets/ground_bg.png';
import {
  Color3,
  DirectionalLight,
  Engine,
  HavokPlugin,
  HemisphericLight,
  // MeshBuilder,
  // PBRMaterial,
  // PhysicsAggregate,
  PhysicsHelper,
  // PhysicsShapeType,
  Scene,
  ShadowGenerator,
  // Texture,
  Vector3,
} from '@babylonjs/core';
import { type HavokPhysicsWithBindings } from '@babylonjs/havok';
import Player, {
  type MOVEMENT_DIRECTION,
} from '@/entities/Game/services/Player';
import MultiPlayer from '@/entities/Game/services/MultiPlayer';
import GravitationAction, {
  type GravitationPayload,
} from '@/entities/Game/effects/GravitationAction';
import { interval, Subject, throttle } from 'rxjs';

import '@babylonjs/loaders';
import {
  downGravitationLevel,
  startGravitationLevel,
  upGravitationLevel,
} from '@/entities/Game/effects/getGravitationLevel';
import {
  downRadialExplosionLevel,
  startRadialExplosionLevel,
  upRadialExplosionLevel,
} from '@/entities/Game/effects/getRadialExplosionLevel';
import RadialExplosionAction, {
  type RadialExplosionPayload,
} from '@/entities/Game/effects/RadialExplosionAction';
import UpdraftAction, {
  type UpdraftPayload,
} from '@/entities/Game/effects/UpdraftAction';
import {
  downUpdraftLevel,
  startUpdraftLevel,
  upUpdraftLevel,
} from '@/entities/Game/effects/getUpdraftLevel';
import type { VortexPayload } from '@/entities/Game/effects/VortexAction';
import {
  startVortexLevel,
  upVortexLevel,
} from '@/entities/Game/effects/getVortexLevel';
import VortexAction from '@/entities/Game/effects/VortexAction';
import type AbstractAction from '@/entities/Game/effects/AbstractAction';
import calculateRandomPosition from '@/entities/Game/utils/calculateRandomPosition';
import Fog from '@/entities/Game/services/Fog';
import LevelEnvironment from '@/entities/Game/envirement/LevelEnvironment';
import { CheckPointService } from '@/entities/Game/services/CheckPointService';

const IS_DEBUGING = document.location.hash === '#debug';

export type CAMERA_DIRECTION = 'CAMERA_LEFT' | 'CAMERA_RIGHT';
export type DIRECTION = MOVEMENT_DIRECTION | CAMERA_DIRECTION;
export type PLAYER_ACTION =
  | 'ACTION1'
  | 'ACTION2'
  | 'ACTION3'
  | 'ACTION4'
  | 'ACTION5';

export type ActionsCoolDown = Record<PLAYER_ACTION, number>;

export const actionsCoolDown: ActionsCoolDown = {
  ACTION1: 200,
  ACTION2: 1000,
  ACTION3: 5000,
  ACTION4: 10000,
  ACTION5: 1000,
};

type ActionState = Record<
  PLAYER_ACTION,
  {
    cooldown: number;
    timestamp: number;
  }
>;

export type MultiPlayerActionGravitation = {
  name: 'GRAVITATION';
  payload: GravitationPayload;
};
export type MultiPlayerActionRadialExplosion = {
  name: 'RADIAL_EXPLOSION';
  payload: RadialExplosionPayload;
};
export type MultiPlayerActionUpdraft = {
  name: 'UPDRAFT';
  payload: UpdraftPayload;
};
export type MultiPlayerActionVortex = {
  name: 'VORTEX';
  payload: VortexPayload;
};

export type MultiPlayerActions =
  | MultiPlayerActionGravitation
  | MultiPlayerActionRadialExplosion
  | MultiPlayerActionUpdraft
  | MultiPlayerActionVortex;

export default class Game {
  private _canvas: HTMLCanvasElement;
  private _player!: Player;
  private _engine: Engine;
  private _scene: Scene;
  private _fog: Fog;
  private _cameraAngle = 0;
  public playerCamera: PlayerCamera;
  private _havokInstance: HavokPhysicsWithBindings;
  private _checkPointPosition: Vector3 = new Vector3(0, 30, 0);
  private _shadow: ShadowGenerator;
  private _movementDirection: Set<MOVEMENT_DIRECTION> = new Set([]);
  private _cameraDirection: Set<CAMERA_DIRECTION> = new Set([]);
  private _physicsHelper: PhysicsHelper | null = null;
  private readonly _levelEnvironment: LevelEnvironment;

  private _checkPointServices: CheckPointService[] = [];

  private _skillGravitation = startGravitationLevel;
  private _skillRadialExplosion = startRadialExplosionLevel;
  private _skillUpdraft = startUpdraftLevel;
  private _skillVortex = startVortexLevel;

  private _actions: Record<string, AbstractAction> = {};
  private _playerCancelableActions: Record<string, AbstractAction> = {};

  public multiplayerSubject$ = new Subject<MultiPlayerActions>();

  private _playerPositionSubject = new Subject<{
    x: number;
    y: number;
    z: number;
  }>();

  private _actionState: ActionState = {
    ACTION1: {
      cooldown: 0,
      timestamp: 0,
    },
    ACTION2: {
      cooldown: 0,
      timestamp: 0,
    },
    ACTION3: {
      cooldown: 0,
      timestamp: 0,
    },
    ACTION4: {
      cooldown: 0,
      timestamp: 0,
    },
    ACTION5: {
      cooldown: 0,
      timestamp: 0,
    },
  };

  public actionStateSubject$ = new Subject<ActionState>();

  private _updateActionState(action: PLAYER_ACTION) {
    this._actionState[action].timestamp = Date.now();
    this._actionState[action].cooldown = actionsCoolDown[action];
    this.actionStateSubject$.next(this._actionState);
  }

  private _cooldownAllActions(time: number) {
    const now = Date.now();
    (Object.keys(this._actionState) as PLAYER_ACTION[]).forEach((action) => {
      const actionEndTime =
        this._actionState[action].timestamp +
        this._actionState[action].cooldown;
      const newEndTime = now + time;

      if (actionEndTime < newEndTime) {
        this._actionState[action].timestamp = now;
        this._actionState[action].cooldown = time;
      }
    });
    this.actionStateSubject$.next(this._actionState);
  }

  private isActionReady(action: PLAYER_ACTION) {
    return (
      this._actionState[action].timestamp + this._actionState[action].cooldown <
      Date.now()
    );
  }

  public playerPositionSubject$ = this._playerPositionSubject
    .asObservable()
    .pipe(throttle(() => interval(100)));

  private _multiplayers: Record<string, MultiPlayer> = {};

  constructor(
    canvas: HTMLCanvasElement,
    havokInstance: HavokPhysicsWithBindings
  ) {
    this._canvas = canvas;
    this._engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      deterministicLockstep: true,
      // lockstepMaxSteps: 4,
      // timeStep: 1 / 60,
    });

    this._havokInstance = havokInstance;
    this._scene = this.#createScene();
    this._physicsHelper = new PhysicsHelper(this._scene);

    this.#setFps(1000 / 60);

    if (IS_DEBUGING) {
      import('@babylonjs/inspector')
        .then(({ Inspector }) => {
          Inspector.Show(this._scene, {
            embedMode: true,
            showExplorer: true,
            showInspector: true,
          });
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
    //   this._scene
    // );
    // pointLight.intensity = 1;
    const hemisphericLight = new HemisphericLight(
      'hemiLight',
      new Vector3(0, 1, 0),
      this._scene
    );
    hemisphericLight.intensity = 0.005;
    const light = new DirectionalLight(
      'dirLight',
      new Vector3(-1, -2, -1),
      this._scene
    );
    light.specular = new Color3(0, 0, 0);
    light.intensity = 1;
    // light.shadowMinZ = 0;
    // light.shadowMaxZ = 10;

    light.position = new Vector3(20, 40, 20);
    this._shadow = new ShadowGenerator(4096, light);
    this._shadow.usePoissonSampling = true;
    this._shadow.bias = 0.0001;

    this._levelEnvironment = new LevelEnvironment({
      scene: this._scene,
      shadow: this._shadow,
    });
    this.playerCamera = new PlayerCamera(this._scene);
    // this.generalLight = new GeneralLight(this._scene);
    this.initNewPlayer();

    this._levelEnvironment.isReadyPromise.then(() => {
      // todo add method .getCheckPointsCoordinates(): Promise<Vector3> instead this one:
      this._levelEnvironment.checkPointsCoordinates.forEach((position) => {
        const checkPoint = new CheckPointService({
          scene: this._scene,
          position,
        });
        this._checkPointServices.push(checkPoint);
      });
    });

    // new Vector3(0, 30, 0),

    this._engine.runRenderLoop(this.#loop.bind(this));
    // this.#createGround();

    // const envTexture = new CubeTexture(
    //   'https://playground.babylonjs.com/textures/SpecularHDR.dds',
    //   this._scene
    // );
    // this._scene.createDefaultSkybox(envTexture, true, 1000);

    // const env = this._scene.createDefaultEnvironment({
    this._scene.createDefaultEnvironment({
      createGround: false,
      createSkybox: false,
      setupImageProcessing: false,
      toneMappingEnabled: false,
    });

    this._fog = new Fog({
      scene: this._scene,
    });

    // this._scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
    //   'https://playground.babylonjs.com/textures/environment.env',
    //   this._scene
    // );
  }

  onBeforeRenderObservable() {
    this._playerPositionSubject.next({
      x: this._player.playerMesh.position.x,
      y: this._player.playerMesh.position.y,
      z: this._player.playerMesh.position.z,
    });

    if (this._player.playerMesh.position.y < -2) {
      this.initNewPlayer();
    }
  }

  initNewPlayer() {
    this._player?.dispose();
    this._skillGravitation = downGravitationLevel(this._skillGravitation);
    this._skillRadialExplosion = downRadialExplosionLevel(
      this._skillRadialExplosion
    );
    this._skillUpdraft = downUpdraftLevel(this._skillUpdraft);
    this._skillVortex = startVortexLevel;

    this._player = new Player({
      scene: this._scene,
      startPosition: this._checkPointPosition,
      // startPosition: new Vector3(-90, 15, 60),
      shadow: this._shadow,
    });
    this.playerCamera.setTarget(this._player.playerMesh);

    this._player.playerMesh.onBeforeRenderObservable.add(
      this.onBeforeRenderObservable.bind(this)
    );
  }

  #createScene() {
    const gravityVector = new Vector3(0, -20, 0);
    const physicsPlugin = new HavokPlugin(true, this._havokInstance);

    const scene = new Scene(this._engine);

    scene.enablePhysics(gravityVector, physicsPlugin);

    return scene;
  }

  // #createGround() {
  //   // Create a built-in "ground" shape;
  //   const ground = MeshBuilder.CreateGround(
  //     'ground1',
  //     {
  //       width: 100,
  //       height: 100,
  //       subdivisions: 2,
  //       updatable: false,
  //     },
  //     this._scene
  //   );
  //   const material = new PBRMaterial('material1', this._scene);
  //   material.albedoTexture = new Texture(groundTexture, this._scene);
  //   // material.diffuseColor = new Color3(0.1, 0.5, 0.5);
  //   material.metallic = 0;
  //   ground.material = material;
  //   ground.receiveShadows = true;
  //   new PhysicsAggregate(
  //     ground,
  //     PhysicsShapeType.BOX,
  //     { mass: 0, friction: 1 },
  //     this._scene
  //   );
  //   // Return the created scene
  // }

  /**
   * https://forum.babylonjs.com/t/inconsistent-physics-behavior-in-babylon-js-on-different-fps/46475
   */
  #syncFpsAndPhysics() {
    this._scene.getPhysicsEngine()?.setTimeStep(1 / this._engine.getFps());
  }

  #setFps(frameDuration: number) {
    let lastTime = 0;
    let accumulatedTime = 0;

    this._engine.customAnimationFrameRequester = {
      requestAnimationFrame(boundedRenderFunction: () => void) {
        function frameRequestCallback(time: number) {
          accumulatedTime += time - lastTime;
          lastTime = time;

          if (accumulatedTime >= frameDuration) {
            accumulatedTime -= frameDuration;
            boundedRenderFunction();
            return;
          }
          requestAnimationFrame(frameRequestCallback);
        }

        requestAnimationFrame(frameRequestCallback);
      },
    };
  }

  #loop() {
    this.#syncFpsAndPhysics();
    this.#handleChangeCameraAngle();
    // move player
    this._player.move(-this._cameraAngle, this._movementDirection);
    // rotate camera
    this.playerCamera.setAngle(this._cameraAngle);
    // render scene
    this._scene.render();

    this._checkPointServices.forEach((checkPoint) => {
      if (checkPoint.mesh.intersectsMesh(this._player.playerMesh, true)) {
        this._checkPointPosition = checkPoint.mesh.position.clone();
      }
    });
  }

  #handleChangeCameraAngle() {
    // convert milliseconds to seconds
    const deltaTime = this._scene.deltaTime / 1000;
    // angle in degrees per second
    const rotationSpeed = 2;

    if (this._cameraDirection.has('CAMERA_LEFT')) {
      this._cameraAngle += rotationSpeed * deltaTime;
    }
    if (this._cameraDirection.has('CAMERA_RIGHT')) {
      this._cameraAngle -= rotationSpeed * deltaTime;
    }
  }

  public resize() {
    this._engine.resize();
  }

  public setMultiPlayerPosition(
    id: string,
    position: {
      x: number;
      y: number;
      z: number;
    }
  ) {
    const Vector3Position = new Vector3(position.x, position.y, position.z);
    if (!this._multiplayers[id]) {
      this._multiplayers[id] = new MultiPlayer({
        scene: this._scene,
        startPosition: Vector3Position,
        shadow: this._shadow,
      });
    }
    this._multiplayers[id].setPosition(Vector3Position);
  }

  public callWordAction(data: MultiPlayerActions) {
    if (data.name === 'RADIAL_EXPLOSION') {
      this.#callRadialExplosionAction(data.payload);
    }
    if (data.name === 'GRAVITATION') {
      this.#callGravitationAction(data.payload);
    }
    if (data.name === 'UPDRAFT') {
      this.#callUpdraftAction(data.payload);
    }
    if (data.name === 'VORTEX') {
      this.#callVortexAction(data.payload);
    }
  }

  public setPlayerDirection(direction: DIRECTION, isPressed: boolean) {
    if (direction === 'JUMP' && isPressed) {
      Object.values(this._playerCancelableActions).forEach((action) => {
        action.callEndActionStatus();
      });
    }
    // todo refactor
    if (direction === 'CAMERA_LEFT' || direction === 'CAMERA_RIGHT') {
      if (isPressed) {
        this._cameraDirection.add(direction);
      } else {
        this._cameraDirection.delete(direction);
      }
      return;
    }
    if (isPressed) {
      this._movementDirection.add(direction);
    } else {
      this._movementDirection.delete(direction);
    }
  }

  callPlayerAction(action: PLAYER_ACTION) {
    if (!this.isActionReady(action)) {
      return;
    }
    this._updateActionState(action);

    switch (action) {
      case 'ACTION1':
        this.#callPlayerGravitationAction();
        break;
      case 'ACTION2':
        this.#callPlayerRadialExplosionAction();
        break;
      case 'ACTION3':
        this.#callPlayerUpdraftAction();
        this._fog.addVisibility();
        break;
      case 'ACTION4':
        this.#callPlayerVortexAction();
        this._fog.addVisibility();
        this._cooldownAllActions(1500);
        break;
      case 'ACTION5':
        this.#callPlayerForwardImpulseAction();
        break;
    }
  }

  #callPlayerGravitationAction() {
    const gravitationLevel = this._skillGravitation;
    this._skillGravitation = upGravitationLevel(this._skillGravitation);
    if (IS_DEBUGING) {
      console.log('gravitationLevel', gravitationLevel);
    }

    const playerPosition = this._player.playerMesh.getAbsolutePosition();
    const { maxRandomPosition } = gravitationLevel;

    const payload: GravitationPayload = {
      radius: gravitationLevel.radius,
      strength: gravitationLevel.strength,
      position: calculateRandomPosition(playerPosition, maxRandomPosition),
      duration: gravitationLevel.duration,
    };

    this.multiplayerSubject$.next({
      name: 'GRAVITATION',
      payload,
    });
    const action = this.#callGravitationAction(payload);
    if (action) {
      const key = Date.now();
      this._playerCancelableActions[key] = action;
      action.onDispose(() => {
        delete this._playerCancelableActions[key];
      });
    }
  }

  #autoClearFromActionsList(action: AbstractAction) {
    const key = Date.now();
    this._actions[key] = action;
    action.onDispose(() => {
      delete this._actions[key];
    });
  }

  #callGravitationAction(payload: GravitationPayload) {
    if (!this._physicsHelper) {
      return;
    }
    const action = new GravitationAction({
      physicsHelper: this._physicsHelper,
      scene: this._scene,
      payload,
    });
    this.#autoClearFromActionsList(action);
    return action;
  }

  #callPlayerRadialExplosionAction() {
    const radialExplosionLevel = this._skillRadialExplosion;

    this._skillRadialExplosion = upRadialExplosionLevel(radialExplosionLevel);
    if (IS_DEBUGING) {
      console.log('radialExplosionLevel', radialExplosionLevel);
    }

    const playerPosition = this._player.playerMesh.getAbsolutePosition();
    const payload: RadialExplosionPayload = {
      radius: radialExplosionLevel.radius,
      strength: radialExplosionLevel.strength,
      position: calculateRandomPosition(
        playerPosition,
        radialExplosionLevel.maxRandomPosition
      ),
    };
    this.multiplayerSubject$.next({
      name: 'RADIAL_EXPLOSION',
      payload,
    });
    this.#callRadialExplosionAction(payload);
  }

  #callRadialExplosionAction(payload: RadialExplosionPayload) {
    if (!this._physicsHelper) {
      return;
    }
    const action = new RadialExplosionAction({
      physicsHelper: this._physicsHelper,
      scene: this._scene,
      payload,
    });
    this.#autoClearFromActionsList(action);
    return action;
  }

  #callPlayerUpdraftAction() {
    if (!this._physicsHelper) {
      return;
    }
    const updraftLevel = this._skillUpdraft;
    this._skillUpdraft = upUpdraftLevel(updraftLevel);
    if (IS_DEBUGING) {
      console.log('updraftLevel', updraftLevel);
    }

    const playerPosition = this._player.playerMesh.getAbsolutePosition();
    const { maxRandomPosition } = updraftLevel;
    const position = calculateRandomPosition(playerPosition, maxRandomPosition);
    const payload: UpdraftPayload = {
      radius: updraftLevel.radius,
      strength: updraftLevel.strength,
      position,
      height: updraftLevel.height,
      duration: updraftLevel.duration,
    };
    this.multiplayerSubject$.next({
      name: 'UPDRAFT',
      payload,
    });
    this.#callUpdraftAction(payload);
  }

  #callUpdraftAction(payload: UpdraftPayload) {
    if (!this._physicsHelper) {
      return;
    }
    const action = new UpdraftAction({
      physicsHelper: this._physicsHelper,
      scene: this._scene,
      payload,
    });
    this.#autoClearFromActionsList(action);
    return action;
  }

  #callPlayerVortexAction() {
    if (!this._physicsHelper) {
      return;
    }
    const vortexLevel = this._skillVortex;
    this._skillVortex = upVortexLevel(vortexLevel);
    if (IS_DEBUGING) {
      console.log('vortexLevel', vortexLevel);
    }

    const playerPosition = this._player.playerMesh.getAbsolutePosition();
    const { maxRandomPosition } = vortexLevel;
    const position = calculateRandomPosition(playerPosition, maxRandomPosition);
    const payload: VortexPayload = {
      radius: vortexLevel.radius,
      strength: vortexLevel.strength,
      position,
      height: vortexLevel.height,
      duration: vortexLevel.duration,
    };
    this.multiplayerSubject$.next({
      name: 'VORTEX',
      payload,
    });
    this.#callVortexAction(payload);
  }

  #callVortexAction(payload: VortexPayload) {
    if (!this._physicsHelper) {
      return;
    }
    const action = new VortexAction({
      physicsHelper: this._physicsHelper,
      scene: this._scene,
      payload,
      vortexInLoopFn: (vortex) => {
        if (vortex.intersectsMesh(this._player.playerMesh, true)) {
          this._cooldownAllActions(1000);
        }
      },
    });
    this.#autoClearFromActionsList(action);
    return action;
  }

  public dispose() {
    this._engine.stopRenderLoop();
    this._scene.dispose();
    this._engine.dispose();
    this.playerCamera.dispose();
    this._player.dispose();
    this._fog.dispose();
    this._levelEnvironment.dispose().then();
    Object.values(this._actions).forEach((action) => action.dispose());
  }

  #callPlayerForwardImpulseAction() {
    this._player.forwardImpulse(this._cameraAngle);
  }
}
