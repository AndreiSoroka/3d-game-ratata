import { Scene } from '@babylonjs/core';
import { DAY_DURATION } from '../model/dayNightStore';

const FOG_RADIUS = 50;
// Minimum fog distance so nearby objects remain visible
const MIN_FOG_START = 10;
// Maximum fog distance so distant objects fade smoothly
const MAX_FOG_START = 75;

export default class Fog {
  private readonly _scene: Scene;
  private readonly _dayDuration: number;
  private _currentFog = MIN_FOG_START + 20;
  private _loopInterval: number | null = null;

  constructor(options: { scene: Scene; dayDuration?: number }) {
    this._scene = options.scene;
    this._dayDuration = options.dayDuration ?? DAY_DURATION;
    this._scene.fogMode = Scene.FOGMODE_LINEAR;
    this._scene.fogStart = MIN_FOG_START;
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
    this._scene.fogStart = Math.min(
      Math.max(value, MIN_FOG_START),
      MAX_FOG_START
    );
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

  setCoefficient(value: number) {
    const clamped = Math.min(Math.max(value, 0), 1);
    const fogStart = MIN_FOG_START + (MAX_FOG_START - MIN_FOG_START) * clamped;
    this._currentFog = fogStart;
    this._setFogStart(fogStart);
  }

  setTime(time: number) {
    const angle =
      ((time % this._dayDuration) / this._dayDuration) * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    const coefficient = (sunHeight + 1) / 2;
    this.setCoefficient(coefficient);
  }

  dispose() {
    this._clearInterval();
  }
}
