export type UpdraftLevelPayload = {
  radius: number;
  strength: number;
  maxRandomPosition: number;
  height: number;
  duration: number;
};

export const startUpdraftLevel: UpdraftLevelPayload = Object.freeze({
  radius: 10,
  strength: 1,
  maxRandomPosition: 4,
  height: 10,
  duration: 3000,
});

export const maxUpdraftLevel: UpdraftLevelPayload = Object.freeze({
  radius: 30,
  strength: 10,
  maxRandomPosition: 0,
  height: 30,
  duration: 10000,
});

export function upUpdraftLevel(level: UpdraftLevelPayload) {
  const nextLevel = { ...level };

  const skills = Object.keys(level) as (keyof UpdraftLevelPayload)[];
  const skillPriority = skills.sort(() => Math.random() - 0.5);

  for (const skill of skillPriority) {
    if (skill === 'radius' && nextLevel.radius < maxUpdraftLevel.radius) {
      nextLevel.radius += 0.05;
      return nextLevel;
    }
    if (skill === 'strength' && nextLevel.strength < maxUpdraftLevel.strength) {
      nextLevel.strength += 0.1;
      return nextLevel;
    }
    if (
      skill === 'maxRandomPosition' &&
      nextLevel.maxRandomPosition > maxUpdraftLevel.maxRandomPosition
    ) {
      nextLevel.maxRandomPosition -= 0.5;
      return nextLevel;
    }
    if (skill === 'height' && nextLevel.height < maxUpdraftLevel.height) {
      nextLevel.height += 0.2;
      return nextLevel;
    }
    if (skill === 'duration' && nextLevel.duration < maxUpdraftLevel.duration) {
      nextLevel.duration += 200;
      return nextLevel;
    }
  }
  return nextLevel;
}
