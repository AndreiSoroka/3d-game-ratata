export type GravitationLevelPayload = {
  radius: number;
  strength: number;
  maxRandomPosition: number;
  duration: number;
};

export const startGravitationLevel: GravitationLevelPayload = Object.freeze({
  radius: 4.5,
  strength: 30,
  maxRandomPosition: 4,
  duration: 3000,
});
export const maxGravitationLevel: GravitationLevelPayload = Object.freeze({
  radius: 8,
  strength: 70,
  maxRandomPosition: 0,
  duration: 5000,
});

export function upGravitationLevel(level: GravitationLevelPayload) {
  const nextLevel = { ...level };

  const skills = Object.keys(level) as (keyof GravitationLevelPayload)[];
  const skillPriority = skills.sort(() => Math.random() - 0.5);

  for (const skill of skillPriority) {
    if (skill === 'radius' && nextLevel.radius < maxGravitationLevel.radius) {
      nextLevel.radius += 0.05;
      return nextLevel;
    }
    if (
      skill === 'strength' &&
      nextLevel.strength < maxGravitationLevel.strength
    ) {
      nextLevel.strength += 0.1;
      return nextLevel;
    }
    if (
      skill === 'maxRandomPosition' &&
      nextLevel.maxRandomPosition > maxGravitationLevel.maxRandomPosition
    ) {
      nextLevel.maxRandomPosition -= 0.5;
      return nextLevel;
    }
    if (
      skill === 'duration' &&
      nextLevel.duration < maxGravitationLevel.duration
    ) {
      nextLevel.duration += 50;
      return nextLevel;
    }
  }
  return nextLevel;
}
