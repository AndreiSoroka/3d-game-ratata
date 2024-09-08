import type { Scene } from '@babylonjs/core';
import { HemisphericLight, Vector3 } from '@babylonjs/core';

export default class GeneralLight {
  #scene: Scene;
  #light: HemisphericLight;
  #intensity = 0.3;

  constructor(scene: Scene) {
    this.#scene = scene;
    this.#light = this.#createLight();

    this.#light.intensity = this.#intensity;
  }

  get light() {
    return this.#light;
  }

  #createLight() {
    return new HemisphericLight(
      'GeneralLight',
      new Vector3(0, 1, 0),
      this.#scene
    );
  }
}
