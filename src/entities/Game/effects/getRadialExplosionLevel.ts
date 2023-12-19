export type RadialExplosionLevelPayload = {
  radius: number;
  strength: number;
  maxRandomPosition: number;
};

export const startRadialExplosionLevel: RadialExplosionLevelPayload =
  Object.freeze({
    radius: 5,
    strength: 20,
    maxRandomPosition: 1,
  });
export const maxRadialExplosionLevel: RadialExplosionLevelPayload =
  Object.freeze({
    radius: 12,
    strength: 70,
    maxRandomPosition: 0,
  });

function updateRadius(radius: number, status: 'up' | 'down') {
  if (status === 'up' && radius < maxRadialExplosionLevel.radius) {
    return Math.min(radius + 0.05, maxRadialExplosionLevel.radius);
  }
  if (status === 'down' && radius > startRadialExplosionLevel.radius) {
    return Math.max(radius - 0.3, startRadialExplosionLevel.radius);
  }
  return radius;
}

function updateStrength(strength: number, status: 'up' | 'down') {
  if (status === 'up' && strength < maxRadialExplosionLevel.strength) {
    return Math.min(
      strength + Math.random() * 5,
      maxRadialExplosionLevel.strength
    );
  }
  if (status === 'down' && strength > startRadialExplosionLevel.strength) {
    return Math.max(
      strength - Math.random() * 20,
      startRadialExplosionLevel.strength
    );
  }
  return strength;
}

function updateMaxRandomPosition(
  maxRandomPosition: number,
  status: 'up' | 'down'
) {
  if (
    status === 'up' &&
    maxRandomPosition > maxRadialExplosionLevel.maxRandomPosition
  ) {
    return Math.max(
      maxRandomPosition - 0.5,
      maxRadialExplosionLevel.maxRandomPosition
    );
  }
  if (
    status === 'down' &&
    maxRandomPosition < startRadialExplosionLevel.maxRandomPosition
  ) {
    return Math.min(
      maxRandomPosition + 0.5,
      startRadialExplosionLevel.maxRandomPosition
    );
  }
  return maxRandomPosition;
}

export function upRadialExplosionLevel(
  level: RadialExplosionLevelPayload,
  customSkillPriority?: keyof RadialExplosionLevelPayload
) {
  const nextLevel = { ...level };

  const skills = Object.keys(level) as (keyof RadialExplosionLevelPayload)[];
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
  }
  return nextLevel;
}

export function downRadialExplosionLevel(
  level: RadialExplosionLevelPayload
): RadialExplosionLevelPayload {
  if (Math.random() < 0.1) {
    return level;
  }
  const nextLevel = { ...level };

  nextLevel.radius = updateRadius(nextLevel.radius, 'down');
  nextLevel.maxRandomPosition = updateMaxRandomPosition(
    nextLevel.maxRandomPosition,
    'down'
  );
  nextLevel.strength = updateStrength(nextLevel.strength, 'down');
  return nextLevel;
}
