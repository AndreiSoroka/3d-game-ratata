import { createAvatar } from '@dicebear/core';
import { botttsNeutral } from '@dicebear/collection';

function convertColors(colors: string[]) {
  return colors.map((color) => color.replace('#', ''));
}

const backgroundColor = convertColors([
  '#b6e3f4',
  '#c0aede',
  '#d1d4f9',
  '#ffd5dc',
  '#f4b6b2',
  '#f4d1c6',
  '#f4b6b2',
  '#ffdfbf',
  '#8d5524',
  '#a26d3d',
  '#b68655',
  '#cb9e6e',
  '#e0b687',
  '#eac393',
  '#f5cfa0',
  '#ffdbac',
  '#00acc1',
  '#1e88e5',
  '#5e35b1',
  '#6d4c41',
  '#8e24aa',
  '#7cb342',
  '#039be5',
  '#43a047',
  '#546e7a',
  '#00897b',
  '#3949ab',
  '#757575',
  '#c0ca33',
  '#d81b60',
  '#e53935',
  '#f4511e',
  '#fb8c00',
  '#fdd835',
  '#ffb300',
]);

export function createAvatarSvg(seed: string) {
  return createAvatar(botttsNeutral, {
    seed,
    size: 100,
    flip: true,
    backgroundColor,
  });
}
