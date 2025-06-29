import type { Scene } from '@babylonjs/core';
import { HemisphericLight, Vector3 } from '@babylonjs/core';

export default class GeneralLight {
  private _scene: Scene;
  private _light: HemisphericLight;
  private _intensity = 0.3;

  constructor(scene: Scene) {
    this._scene = scene;
    this._light = this.#createLight();

    this._light.intensity = this._intensity;
  }

  get light() {
    return this._light;
  }

  #createLight() {
    return new HemisphericLight(
      'GeneralLight',
      new Vector3(0, 1, 0),
      this._scene
    );
  }
}
