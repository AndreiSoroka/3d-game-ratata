export type GravitationLevelPayload = {
  radius: number;
  strength: number;
  maxRandomPosition: number;
  duration: number;
};

export const startGravitationLevel: GravitationLevelPayload = Object.freeze({
  radius: 4.5,
  strength: 40,
  maxRandomPosition: 4,
  duration: 3000,
});
export const maxGravitationLevel: GravitationLevelPayload = Object.freeze({
  radius: 8,
  strength: 200,
  maxRandomPosition: 1,
  duration: 5000,
});

function updateRadius(radius: number, status: 'up' | 'down') {
  if (status === 'up' && radius < maxGravitationLevel.radius) {
    return Math.min(radius + 0.05, maxGravitationLevel.radius);
  }
  if (status === 'down' && radius > startGravitationLevel.radius) {
    return Math.max(radius - 0.3, startGravitationLevel.radius);
  }
  return radius;
}

function updateStrength(strength: number, status: 'up' | 'down') {
  if (status === 'up' && strength < maxGravitationLevel.strength) {
    return Math.min(strength + Math.random() * 5, maxGravitationLevel.strength);
  }
  if (status === 'down' && strength > startGravitationLevel.strength) {
    return Math.max(
      strength - Math.random() * 20,
      startGravitationLevel.strength
    );
  }
  return strength;
}

function updateDuration(duration: number, status: 'up' | 'down') {
  if (status === 'up' && duration < maxGravitationLevel.duration) {
    return Math.min(duration + 50, maxGravitationLevel.duration);
  }
  if (status === 'down' && duration > startGravitationLevel.duration) {
    return Math.max(duration - 300, startGravitationLevel.duration);
  }
  return duration;
}

function updateMaxRandomPosition(
  maxRandomPosition: number,
  status: 'up' | 'down'
) {
  if (
    status === 'up' &&
    maxRandomPosition > maxGravitationLevel.maxRandomPosition
  ) {
    return Math.max(
      maxRandomPosition - 0.5,
      maxGravitationLevel.maxRandomPosition
    );
  }
  if (
    status === 'down' &&
    maxRandomPosition < startGravitationLevel.maxRandomPosition
  ) {
    return Math.min(
      maxRandomPosition + 0.5,
      startGravitationLevel.maxRandomPosition
    );
  }
  return maxRandomPosition;
}

export function upGravitationLevel(
  level: GravitationLevelPayload,
  customSkillPriority?: keyof GravitationLevelPayload
): GravitationLevelPayload {
  if (Math.random() < 0.3) {
    return level;
  }
  const nextLevel = { ...level };

  const skills = Object.keys(level) as (keyof GravitationLevelPayload)[];
  const skill =
    customSkillPriority ?? skills.sort(() => Math.random() - 0.5).at(0);
  switch (skill) {
    case 'radius':
      nextLevel.radius = updateRadius(nextLevel.radius, 'up');
      break;
    case 'strength':
      nextLevel.strength = updateStrength(nextLevel.strength, 'up');
      break;
    case 'maxRandomPosition':
      nextLevel.maxRandomPosition = updateMaxRandomPosition(
        nextLevel.maxRandomPosition,
        'up'
      );
      break;
    case 'duration':
      nextLevel.duration = updateDuration(nextLevel.duration, 'up');
      break;
  }

  return nextLevel;
}

export function downGravitationLevel(
  level: GravitationLevelPayload
): GravitationLevelPayload {
  if (Math.random() < 0.1) {
    return level;
  }
  const nextLevel = { ...level };

  nextLevel.radius = updateRadius(nextLevel.radius, 'down');
  nextLevel.strength = updateStrength(nextLevel.strength, 'down');
  nextLevel.maxRandomPosition = updateMaxRandomPosition(
    nextLevel.maxRandomPosition,
    'down'
  );
  nextLevel.duration = updateDuration(nextLevel.duration, 'down');
  return nextLevel;
}
