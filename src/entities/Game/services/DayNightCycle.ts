import {
  Color3,
  DirectionalLight,
  HemisphericLight,
  Mesh,
  PointLight,
  Scene,
  Vector3,
} from '@babylonjs/core';

export default class DayNightCycle {
  private readonly _scene: Scene;
  private readonly _sunLight: DirectionalLight;
  private readonly _moonLight: DirectionalLight;
  private readonly _ambientLight: HemisphericLight;
  private readonly _glowLight: PointLight;
  private readonly _dayDuration: number;
  private readonly _radius: number;
  private _targetMesh: Mesh;
  private _time = 0;
  private _lastUpdate = 0;
  private _fogCoefficient = 1;
  private readonly _twilight = 0.2;

  constructor(options: {
    scene: Scene;
    sunLight: DirectionalLight;
    targetMesh: Mesh;
    dayDuration?: number;
    radius?: number;
  }) {
    this._scene = options.scene;
    this._sunLight = options.sunLight;
    this._targetMesh = options.targetMesh;
    this._dayDuration = options.dayDuration ?? 5 * 60 * 1000;
    this._radius = options.radius ?? 50;

    this._moonLight = new DirectionalLight(
      'moonLight',
      new Vector3(1, 2, 1),
      this._scene
    );
    this._moonLight.specular = new Color3(0, 0, 0);
    this._moonLight.diffuse = new Color3(0.6, 0.6, 1);
    this._moonLight.intensity = 0;

    this._ambientLight = new HemisphericLight(
      'ambientLight',
      new Vector3(0, 1, 0),
      this._scene
    );
    this._ambientLight.intensity = 0.005;

    this._glowLight = new PointLight(
      'moonGlow',
      this._targetMesh.position.clone(),
      this._scene
    );
    this._glowLight.diffuse = new Color3(0.4, 0.4, 1);
    this._glowLight.specular = new Color3(0, 0, 0);
    this._glowLight.intensity = 0;
  }

  setTarget(mesh: Mesh) {
    this._targetMesh = mesh;
    this._glowLight.position.copyFrom(mesh.position);
  }

  setTime(time: number) {
    this._time = time;
    this._update();
  }

  private _update() {
    const elapsed = this._time % this._dayDuration;
    const angle = (elapsed / this._dayDuration) * Math.PI * 2;

    const target = this._targetMesh.position;

    const verticalAmplitude = this._radius * 0.5;
    const sunX = Math.cos(angle) * this._radius;
    const sunY = Math.sin(angle) * verticalAmplitude;
    const sunZ = Math.sin(angle) * this._radius;

    const sunPosition = new Vector3(
      target.x + sunX,
      target.y + sunY,
      target.z + sunZ
    );
    this._sunLight.position.copyFrom(sunPosition);
    this._sunLight.setDirectionToTarget(target);

    const moonPosition = new Vector3(
      target.x - sunX,
      target.y - sunY,
      target.z - sunZ
    );
    this._moonLight.position.copyFrom(moonPosition);
    this._moonLight.setDirectionToTarget(target);
    this._glowLight.position.copyFrom(target);

    const sunHeight = sunY / verticalAmplitude;
    const dayStrength = Math.min(
      Math.max((sunHeight + this._twilight) / (1 + this._twilight), 0),
      1
    );
    const nightStrength = Math.min(
      Math.max((-sunHeight + this._twilight) / (1 + this._twilight), 0),
      1
    );
    const delta = Math.abs(this._time - this._lastUpdate);
    const lerpFactor = Math.min(delta / 500, 1);
    const targetSunIntensity = dayStrength > 0 ? 0.8 + dayStrength * 0.4 : 0;
    const targetMoonIntensity = nightStrength * 0.3;
    this._sunLight.intensity +=
      (targetSunIntensity - this._sunLight.intensity) * lerpFactor;
    this._moonLight.intensity +=
      (targetMoonIntensity - this._moonLight.intensity) * lerpFactor;
    this._glowLight.intensity +=
      (nightStrength * 0.25 - this._glowLight.intensity) * lerpFactor;
    this._lastUpdate = this._time;

    const warmColor = new Color3(1, 0.6, 0.3);
    this._sunLight.diffuse = Color3.Lerp(
      warmColor,
      Color3.White(),
      dayStrength
    );

    this._fogCoefficient = (sunHeight + 1) / 2;
  }

  dispose() {
    this._ambientLight.dispose();
    this._moonLight.dispose();
    this._glowLight.dispose();
  }

  get fogCoefficient() {
    return this._fogCoefficient;
  }

  get dayDuration() {
    return this._dayDuration;
  }
}
