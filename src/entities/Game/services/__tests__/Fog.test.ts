import { describe, it, expect } from 'vitest';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import Fog from '../Fog';

describe('Fog', () => {
  it('adjusts fog distance based on time', () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const fog = new Fog({ scene, dayDuration: 1000 });
    fog.setTime(0);
    expect(scene.fogStart).toBeCloseTo(42.5);
    fog.setTime(250);
    expect(scene.fogStart).toBeCloseTo(75);
    fog.setTime(500);
    expect(scene.fogStart).toBeCloseTo(42.5);
    fog.setTime(750);
    expect(scene.fogStart).toBeCloseTo(10);
  });
});
