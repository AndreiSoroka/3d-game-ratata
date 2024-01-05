import type { Mesh } from '@babylonjs/core';

export type TypeOfMesh = 'environment' | 'checkpoint';

export default function getTypeOfMesh(meshOrName: Mesh | string): TypeOfMesh {
  const name = typeof meshOrName === 'string' ? meshOrName : meshOrName.name;
  if (name.includes('checkpoint')) {
    return 'checkpoint';
  }

  //
  // if (mesh.name.includes('ground')) {
  //   return 'ground';
  // }
  //
  // if (mesh.name.includes('wall')) {
  //   return 'wall';
  // }
  //
  // if (mesh.name.includes('door')) {
  //   return 'door';
  // }
  //
  // if (mesh.name.includes('key')) {
  //   return 'key';
  // }
  //
  // if (mesh.name.includes('enemy')) {
  //   return 'enemy';
  // }
  //
  // if (mesh.name.includes('player')) {
  //   return 'player';
  // }
  //
  // if (mesh.name.includes('coin')) {
  //   return 'coin';
  // }
  //
  // if (mesh.name.includes('spike')) {
  //   return 'spike';
  // }
  //
  // if (mesh.name.includes('finish')) {
  //   return 'finish';
  // }
  //
  // if (mesh.name.includes('lava')) {
  //   return 'lava';
  // }
  // if (mesh.name.includes('water')) {
  //   return 'water';
  // }
  // if (mesh.name.includes('teleport')) {
  //   return 'teleport';
  // }

  return 'environment';
}
