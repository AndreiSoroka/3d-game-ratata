import {
  AbstractMesh,
  ArcRotateCamera,
  type Mesh,
  Ray,
  RayHelper,
  type Scene,
  Vector3,
} from '@babylonjs/core';

const CAMERA_ZOOM_STEPS = 30;
const CAMERA_MAX_RADIUS = 30;
const CAMERA_MIN_RADIUS = 20;
const CAMERA_RADIUS_SPEED =
  (CAMERA_MAX_RADIUS - CAMERA_MIN_RADIUS) / CAMERA_ZOOM_STEPS;
const CAMERA_MAX_BETA = 1.3;
const CAMERA_MIN_BETA = 1;
const CAMERA_BETA_SPEED =
  (CAMERA_MAX_BETA - CAMERA_MIN_BETA) / CAMERA_ZOOM_STEPS;
const CAMERA_ADJUST_DELAY = 500;

type MeshHit = {
  originMaterial: AbstractMesh['material'];
};

export default class PlayerCamera {
  private readonly _scene: Scene;
  private readonly _camera: ArcRotateCamera;
  private readonly _payerUpRay: Ray;
  private readonly _ray: Ray;
  private readonly _diagonalRays: Ray[];
  private readonly _slowLoopInterval: number;
  private readonly _loopInterval: number;
  private _isZooming = false;
  private lastAdjustmentTime = Date.now();
  private readonly _hits = new Map<AbstractMesh, MeshHit>();
  private readonly _isDebugging: boolean;

  constructor(scene: Scene, options?: { isDebugging?: boolean }) {
    this._scene = scene;
    this._isDebugging = options?.isDebugging ?? false;
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
    this._payerUpRay = new Ray(Vector3.Zero(), Vector3.Up(), 10);

    if (this._isDebugging) {
      const rayHelper = new RayHelper(this._ray);
      rayHelper.show(scene);
      this._diagonalRays.forEach((ray) => {
        const rayHelper = new RayHelper(ray);
        rayHelper.show(scene);
      });
      const rayHelperUp = new RayHelper(this._payerUpRay);
      rayHelperUp.show(scene);
    }

    this._slowLoopInterval = window.setInterval(this._slowLoop.bind(this), 200);
    this._loopInterval = window.setInterval(this._loop.bind(this), 15);
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
    const directHits =
      this._scene.multiPickWithRay(this._ray, this.isEnvMesh) ?? [];
    const diagonalHits = this._diagonalRays.flatMap(
      (ray) => this._scene.multiPickWithRay(ray, this.isEnvMesh) ?? []
    );
    return [...directHits, ...diagonalHits];
  }

  private _getPayerUpHit() {
    return this._scene.pickWithRay(this._payerUpRay, this.isEnvMesh);
  }

  private isEnvMesh(mesh: AbstractMesh) {
    return mesh.parent?.name === 'environment'; // todo make const
  }

  private _slowLoop() {
    this._updateRaysPosition();

    const playerUpHit = this._getPayerUpHit();
    this._isZooming = !!playerUpHit?.pickedMesh;

    const hits = this._getHits();

    // make transparent
    for (const hit of hits) {
      if (!hit.pickedMesh || !hit.hit) {
        continue;
      }
      if (this._hits.has(hit.pickedMesh)) {
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
    if (this._isZooming) {
      this._camera.radius = Math.max(
        this._camera.radius - CAMERA_RADIUS_SPEED,
        CAMERA_MIN_RADIUS
      );
      this._camera.beta = Math.min(
        this._camera.beta + CAMERA_BETA_SPEED,
        CAMERA_MAX_BETA
      );
    } else {
      this._camera.radius = Math.min(
        this._camera.radius + CAMERA_RADIUS_SPEED,
        CAMERA_MAX_RADIUS
      );
      this._camera.beta = Math.max(
        this._camera.beta - CAMERA_BETA_SPEED,
        CAMERA_MIN_BETA
      );
    }
  }

  public setTarget(target: Mesh) {
    this._camera.lockedTarget = target;
    this._payerUpRay.origin = target.position;
  }

  public setAngle(angle: number) {
    this._camera.alpha = angle;
  }

  dispose() {
    this._camera.dispose();
    clearInterval(this._slowLoopInterval);
    clearInterval(this._loopInterval);
  }
}
