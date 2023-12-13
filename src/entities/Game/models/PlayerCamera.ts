import type { Mesh, Scene } from 'babylonjs';
import { ArcRotateCamera, Vector3 } from 'babylonjs';

export default class PlayerCamera {
  #scene: Scene;
  #camera: ArcRotateCamera;

  constructor(scene: Scene) {
    this.#scene = scene;
    this.#camera = this.#createCamera();
  }

  #createCamera() {
    return new ArcRotateCamera(
      'PlayerCamera',
      Math.PI * 1.3,
      1,
      30,
      new Vector3(0, 0, 0),
      this.#scene
    );
  }

  public setTarget(target: Mesh) {
    this.#camera.lockedTarget = target;
  }

  public setAngle(angle: number) {
    this.#camera.alpha = angle;
  }
}
