export type RadialExplosionLevelPayload = {
  radius: number;
  strength: number;
  maxRandomPosition: number;
};

export const startRadialExplosionLevel: RadialExplosionLevelPayload =
  Object.freeze({
    radius: 8,
    strength: 20,
    maxRandomPosition: 4,
  });
export const maxRadialExplosionLevel: RadialExplosionLevelPayload =
  Object.freeze({
    radius: 12,
    strength: 70,
    maxRandomPosition: 0,
  });

export function upRadialExplosionLevel(level: RadialExplosionLevelPayload) {
  const nextLevel = { ...level };

  const skills = Object.keys(level) as (keyof RadialExplosionLevelPayload)[];
  const skillPriority = skills.sort(() => Math.random() - 0.5);

  for (const skill of skillPriority) {
    if (
      skill === 'radius' &&
      nextLevel.radius < maxRadialExplosionLevel.radius
    ) {
      nextLevel.radius += 0.05;
      return nextLevel;
    }
    if (
      skill === 'strength' &&
      nextLevel.strength < maxRadialExplosionLevel.strength
    ) {
      nextLevel.strength += 0.1;
      return nextLevel;
    }
    if (
      skill === 'maxRandomPosition' &&
      nextLevel.maxRandomPosition > maxRadialExplosionLevel.maxRandomPosition
    ) {
      nextLevel.maxRandomPosition -= 0.5;
      return nextLevel;
    }
  }
  return nextLevel;
}
