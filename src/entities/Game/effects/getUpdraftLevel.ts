export type UpdraftLevelPayload = {
  radius: number;
  strength: number;
  maxRandomPosition: number;
  height: number;
  duration: number;
};

export const startUpdraftLevel: UpdraftLevelPayload = Object.freeze({
  radius: 8,
  strength: 10,
  maxRandomPosition: 4,
  height: 10,
  duration: 3000,
});

export const maxUpdraftLevel: UpdraftLevelPayload = Object.freeze({
  radius: 15,
  strength: 15,
  maxRandomPosition: 0,
  height: 30,
  duration: 10000,
});

function updateRadius(radius: number, status: 'up' | 'down') {
  if (status === 'up' && radius < maxUpdraftLevel.radius) {
    return Math.min(radius + Math.random(), maxUpdraftLevel.radius);
  }
  if (status === 'down' && radius > startUpdraftLevel.radius) {
    return Math.max(radius - Math.random() * 3, startUpdraftLevel.radius);
  }
  return radius;
}

function updateStrength(strength: number, status: 'up' | 'down') {
  if (status === 'up' && strength < maxUpdraftLevel.strength) {
    return Math.min(strength + Math.random() * 2, maxUpdraftLevel.strength);
  }
  if (status === 'down' && strength > startUpdraftLevel.strength) {
    return Math.max(strength - Math.random() * 5, startUpdraftLevel.strength);
  }
  return strength;
}

function updateMaxRandomPosition(
  maxRandomPosition: number,
  status: 'up' | 'down'
) {
  if (
    status === 'up' &&
    maxRandomPosition > maxUpdraftLevel.maxRandomPosition
  ) {
    return Math.max(
      maxRandomPosition - Math.random() - 0.1,
      maxUpdraftLevel.maxRandomPosition
    );
  }
  if (
    status === 'down' &&
    maxRandomPosition < startUpdraftLevel.maxRandomPosition
  ) {
    return Math.min(
      maxRandomPosition + Math.random() * 2,
      startUpdraftLevel.maxRandomPosition
    );
  }
  return maxRandomPosition;
}

function updateDuration(duration: number, status: 'up' | 'down') {
  if (status === 'up' && duration < maxUpdraftLevel.duration) {
    return Math.min(duration + 350, maxUpdraftLevel.duration);
  }
  if (status === 'down' && duration > startUpdraftLevel.duration) {
    return Math.max(duration - 700, startUpdraftLevel.duration);
  }
  return duration;
}

function updateHeight(height: number, status: 'up' | 'down') {
  if (status === 'up' && height < maxUpdraftLevel.height) {
    return Math.min(height + Math.random() + 0.5, maxUpdraftLevel.height);
  }
  if (status === 'down' && height > startUpdraftLevel.height) {
    return Math.max(height - 3, startUpdraftLevel.height);
  }
  return height;
}

export function upUpdraftLevel(
  level: UpdraftLevelPayload,
  customSkillPriority?: keyof UpdraftLevelPayload
) {
  const nextLevel = { ...level };

  const skills = Object.keys(level) as (keyof UpdraftLevelPayload)[];
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

export function downUpdraftLevel(
  level: UpdraftLevelPayload
): UpdraftLevelPayload {
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
