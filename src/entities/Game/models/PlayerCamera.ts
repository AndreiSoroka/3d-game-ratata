import {
  AbstractMesh,
  ArcRotateCamera,
  type Mesh,
  Ray,
  RayHelper,
  type Scene,
  Vector3,
} from '@babylonjs/core';

const IS_DEBUGING = document.location.hash === '#debug';

const CAMERA_MAX_RADIUS = 30;
const CAMERA_MIN_RADIUS = 20;
const CAMERA_MAX_BETA = 1.2;
const CAMERA_MIN_BETA = 1;
const CAMERA_ADJUST_DELAY = 500;

export default class PlayerCamera {
  private readonly _scene: Scene;
  private readonly _camera: ArcRotateCamera;
  private readonly _ray: Ray;
  private readonly _diagonalRays: Ray[];
  private readonly _slowLoopInterval: number;
  private lastAdjustmentTime = Date.now();
  private readonly _hits = new Map<
    AbstractMesh,
    {
      originMaterial: AbstractMesh['material'];
    }
  >();

  constructor(scene: Scene) {
    this._scene = scene;
    this._camera = new ArcRotateCamera(
      'PlayerCamera',
      Math.PI * 1.3,
      CAMERA_MIN_BETA,
      CAMERA_MAX_RADIUS,
      new Vector3(0, 0, 0),
      this._scene
    );
    this._camera.minZ = 0;
    this._camera.maxZ = 100;

    this._ray = new Ray(this._camera.position, Vector3.Forward(), 0);
    this._diagonalRays = Array.from(
      { length: 4 },
      () => new Ray(this._camera.position, Vector3.Forward(), 0)
    );

    if (IS_DEBUGING) {
      const rayHelper = new RayHelper(this._ray);
      rayHelper.show(scene);
      this._diagonalRays.forEach((ray) => {
        const rayHelper = new RayHelper(ray);
        rayHelper.show(scene);
      });
    }

    this._slowLoopInterval = setInterval(this._slowLoop.bind(this), 200);
    setInterval(this._loop.bind(this), 30);
  }

  private _updateRaysPosition() {
    const forwardDirection = this._camera.getForwardRay(1).direction;
    const upDirection = this._camera.getDirection(Vector3.Up());
    const rightDirection = this._camera.getDirection(Vector3.Right());

    const targetPosition = this._camera.lockedTarget.position;
    const cameraPosition = this._camera.position;
    const length = Vector3.Distance(cameraPosition, targetPosition);
    this._ray.length = length;
    this._diagonalRays.forEach((ray) => (ray.length = length * 0.75));

    const diagonalDistance = 0.1;
    const diagonals = [
      // top right
      upDirection
        .scale(diagonalDistance)
        .add(rightDirection.scale(diagonalDistance)),
      // top left
      upDirection
        .scale(diagonalDistance)
        .subtract(rightDirection.scale(diagonalDistance)),
      // bottom left
      upDirection.scale(-0.01).subtract(rightDirection.scale(diagonalDistance)),
      // bottom right
      upDirection.scale(-0.01).add(rightDirection.scale(diagonalDistance)),
    ];

    this._ray.direction.copyFrom(forwardDirection);

    // Обновление диагональных лучей
    diagonals.forEach((diagonal, i) => {
      this._diagonalRays[i].direction.copyFrom(
        forwardDirection.add(diagonal).normalize()
      );
    });
  }

  private _getHits() {
    const directHits = this._scene.multiPickWithRay(this._ray) ?? [];
    const diagonalHits = this._diagonalRays.flatMap(
      (ray) => this._scene.multiPickWithRay(ray) ?? []
    );
    return [...directHits, ...diagonalHits];
  }

  private _slowLoop() {
    this._updateRaysPosition();
    const hits = this._getHits();

    // make transparent
    for (const hit of hits) {
      if (!hit.pickedMesh || !hit.hit) {
        continue;
      }
      if (this._hits.has(hit.pickedMesh)) {
        continue;
      }

      if (hit.pickedMesh.parent?.name !== 'env') {
        continue;
      }

      this._hits.set(hit.pickedMesh, {
        originMaterial: hit.pickedMesh.material,
      });
      if (hit.pickedMesh.material) {
        hit.pickedMesh.material = hit.pickedMesh.material.clone(
          'transparent' + hit.pickedMesh.name
        );
        if (!hit.pickedMesh.material) {
          throw new Error('Material not found');
        }
        hit.pickedMesh.material.transparencyMode = 2;
      }
    }

    // make opaque
    for (const [mesh, { originMaterial }] of this._hits.entries()) {
      if (!hits?.length || !hits.find((hit) => hit.pickedMesh === mesh)) {
        this._hits.delete(mesh);
        if (mesh.material) {
          mesh.material = originMaterial;
        }
      }
    }
  }

  private _loop() {
    this._hits.forEach((hit, mesh) => {
      if (mesh.material && mesh.material.alpha > 0.4) {
        mesh.material.alpha = Math.max(mesh.material.alpha - 0.1, 0.4);
      }
    });

    if (Date.now() - this.lastAdjustmentTime < CAMERA_ADJUST_DELAY) {
      return;
    }
    if (this._hits.size) {
      this._camera.radius = Math.max(
        this._camera.radius - 0.5,
        CAMERA_MIN_RADIUS
      );
      this._camera.beta = Math.min(this._camera.beta + 0.01, CAMERA_MAX_BETA);
    } else {
      this._camera.radius = Math.min(
        this._camera.radius + 0.5,
        CAMERA_MAX_RADIUS
      );
      this._camera.beta = Math.max(this._camera.beta - 0.01, CAMERA_MIN_BETA);
    }
  }

  public setTarget(target: Mesh) {
    this._camera.lockedTarget = target;
  }

  public setAngle(angle: number) {
    this._camera.alpha = angle;
  }

  dispose() {
    this._camera.dispose();
    clearInterval(this._slowLoopInterval);
  }
}
