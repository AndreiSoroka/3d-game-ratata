export type VortexLevelPayload = {
  radius: number;
  strength: number;
  maxRandomPosition: number;
  height: number;
  duration: number;
};

export const startVortexLevel: VortexLevelPayload = Object.freeze({
  radius: 10,
  strength: 20,
  maxRandomPosition: 4,
  height: 30,
  duration: 5000,
});

export const maxVortexLevel: VortexLevelPayload = Object.freeze({
  radius: 30,
  strength: 50,
  maxRandomPosition: 0,
  height: 150,
  duration: 10000,
});

export function upVortexLevel(level: VortexLevelPayload) {
  const nextLevel = { ...level };

  const skills = Object.keys(level) as (keyof VortexLevelPayload)[];
  const skillPriority = skills.sort(() => Math.random() - 0.5);

  for (const skill of skillPriority) {
    if (skill === 'radius' && nextLevel.radius < maxVortexLevel.radius) {
      nextLevel.radius += 0.05;
      return nextLevel;
    }
    if (skill === 'strength' && nextLevel.strength < maxVortexLevel.strength) {
      nextLevel.strength += 0.1;
      return nextLevel;
    }
    if (
      skill === 'maxRandomPosition' &&
      nextLevel.maxRandomPosition > maxVortexLevel.maxRandomPosition
    ) {
      nextLevel.maxRandomPosition -= 0.5;
      return nextLevel;
    }
    if (skill === 'height' && nextLevel.height < maxVortexLevel.height) {
      nextLevel.height += 0.2;
      return nextLevel;
    }
    if (skill === 'duration' && nextLevel.duration < maxVortexLevel.duration) {
      nextLevel.duration += 200;
      return nextLevel;
    }
  }
  return nextLevel;
}
