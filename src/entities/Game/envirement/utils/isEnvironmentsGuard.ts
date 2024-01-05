import type { Environment } from '@/entities/Game/envirement/types';

function isEnvironmentGuard(data: unknown): data is Environment {
  if (typeof data !== 'object' || data === null) {
    console.error(new Error('Environment data is not an object'));
    return false;
  }

  if (!('name' in data) || typeof data.name !== 'string') {
    console.error(new Error('Environment data has no correct name'));
    return false;
  }

  if (
    !('location' in data) ||
    !Array.isArray(data.location) ||
    !data.location.every((item: unknown) => typeof item === 'number')
  ) {
    console.error(new Error('Environment data has no correct location'));
    return false;
  }

  if (
    !('rotation_mode' in data) ||
    typeof data.rotation_mode !== 'string' ||
    !['XYZ'].includes(data.rotation_mode)
  ) {
    console.error(new Error('Environment data has no correct rotation_mode'));
    return false;
  }

  if (
    !('rotation' in data) ||
    !Array.isArray(data.rotation) ||
    !data.rotation.every((item: unknown) => typeof item === 'number')
  ) {
    console.error(new Error('Environment data has no correct rotation'));
    return false;
  }

  if (
    !('scale' in data) ||
    !Array.isArray(data.scale) ||
    !data.scale.every((item: unknown) => typeof item === 'number')
  ) {
    console.error(new Error('Environment data has no correct scale'));
    return false;
  }

  return true;
}

export default function isEnvironmentsGuard(
  data: unknown
): data is Environment[] {
  if (!Array.isArray(data)) {
    console.error(new Error('Environment data is not an array'));
    return false;
  }

  if (!data.every(isEnvironmentGuard)) {
    console.error(new Error('Environment data has incorrect items'));
    return false;
  }

  return true;
}
