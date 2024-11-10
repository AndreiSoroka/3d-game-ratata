import { Scene } from '@babylonjs/core';

const FOG_RADIUS = 50;
const MAX_FOG = 75;

export default class Fog {
  private readonly _scene: Scene;
  private _currentFog = 30;
  private _loopInterval: number | null = null;

  constructor(options: { scene: Scene }) {
    this._scene = options.scene;
    this._scene.fogMode = Scene.FOGMODE_LINEAR;
    this._scene.fogStart = 10;
    this._scene.fogEnd = this._scene.fogStart + FOG_RADIUS;

    this._initInterval();
  }

  private _initInterval() {
    this._clearInterval();
    this._loopInterval = window.setInterval(this._loop.bind(this), 100);
  }

  private _clearInterval() {
    if (this._loopInterval) {
      clearInterval(this._loopInterval);
    }
  }

  private _setFogStart(value: number) {
    this._scene.fogStart = Math.min(value, MAX_FOG);
    this._scene.fogEnd = this._scene.fogStart + FOG_RADIUS;
  }

  private _loop() {
    if (this._currentFog >= this._scene.fogStart) {
      this._setFogStart(this._scene.fogStart + 0.1);
    } else {
      this._clearInterval();
    }
  }

  addVisibility() {
    this._currentFog += Math.random() * 3;
    this._initInterval();
  }

  dispose() {
    this._clearInterval();
  }
}
