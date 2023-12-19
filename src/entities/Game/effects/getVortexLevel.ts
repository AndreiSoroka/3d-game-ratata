export type VortexLevelPayload = {
  radius: number;
  strength: number;
  maxRandomPosition: number;
  height: number;
  duration: number;
};

export const startVortexLevel: VortexLevelPayload = Object.freeze({
  radius: 10,
  strength: 50,
  maxRandomPosition: 4,
  height: 30,
  duration: 5000,
});

export const maxVortexLevel: VortexLevelPayload = Object.freeze({
  radius: 30,
  strength: 70,
  maxRandomPosition: 0,
  height: 150,
  duration: 10000,
});

function updateRadius(radius: number, status: 'up' | 'down') {
  if (status === 'up' && radius < maxVortexLevel.radius) {
    return Math.min(radius + Math.random() * 5, maxVortexLevel.radius);
  }
  if (status === 'down' && radius > startVortexLevel.radius) {
    return Math.max(radius - Math.random() * 15, startVortexLevel.radius);
  }
  return radius;
}

function updateStrength(strength: number, status: 'up' | 'down') {
  if (status === 'up' && strength < maxVortexLevel.strength) {
    return Math.min(strength + Math.random() * 5, maxVortexLevel.strength);
  }
  if (status === 'down' && strength > startVortexLevel.strength) {
    return Math.max(strength - Math.random() * 15, startVortexLevel.strength);
  }
  return strength;
}

function updateMaxRandomPosition(
  maxRandomPosition: number,
  status: 'up' | 'down'
) {
  if (status === 'up' && maxRandomPosition > maxVortexLevel.maxRandomPosition) {
    return Math.max(
      maxRandomPosition - Math.random() * 2 - 0.1,
      maxVortexLevel.maxRandomPosition
    );
  }
  if (
    status === 'down' &&
    maxRandomPosition < startVortexLevel.maxRandomPosition
  ) {
    return Math.min(
      maxRandomPosition + Math.random() * 5,
      startVortexLevel.maxRandomPosition
    );
  }
  return maxRandomPosition;
}

function updateDuration(duration: number, status: 'up' | 'down') {
  if (status === 'up' && duration < maxVortexLevel.duration) {
    return Math.min(duration + 350, maxVortexLevel.duration);
  }
  if (status === 'down' && duration > startVortexLevel.duration) {
    return Math.max(duration - 700, startVortexLevel.duration);
  }
  return duration;
}

function updateHeight(height: number, status: 'up' | 'down') {
  if (status === 'up' && height < maxVortexLevel.height) {
    return Math.min(height + Math.random() + 0.5, maxVortexLevel.height);
  }
  if (status === 'down' && height > startVortexLevel.height) {
    return Math.max(height - 3, startVortexLevel.height);
  }
  return height;
}

export function upVortexLevel(
  level: VortexLevelPayload,
  customSkillPriority?: keyof VortexLevelPayload
) {
  const nextLevel = { ...level };

  const skills = Object.keys(level) as (keyof VortexLevelPayload)[];
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
    case 'height':
      nextLevel.height = updateHeight(nextLevel.height, 'up');
      break;
  }
  return nextLevel;
}

export function downVortexLevel(level: VortexLevelPayload): VortexLevelPayload {
  if (Math.random() < 0.1) {
    return level;
  }
  const nextLevel = { ...level };

  nextLevel.strength = updateStrength(nextLevel.strength, 'down');
  nextLevel.radius = updateRadius(nextLevel.radius, 'down');
  nextLevel.maxRandomPosition = updateMaxRandomPosition(
    nextLevel.maxRandomPosition,
    'down'
  );
  nextLevel.duration = updateDuration(nextLevel.duration, 'down');
  nextLevel.height = updateHeight(nextLevel.height, 'down');
  return nextLevel;
}
