import { filter, fromEvent, map, merge, mergeMap, throttleTime } from 'rxjs';
import type { DIRECTION, PLAYER_ACTION } from '@/entities/Game/Game';

type KeyCodesMovement = 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD' | 'KeyQ' | 'KeyE';
type KeyCodesAction = 'Space' | 'Digit1' | 'Digit2' | 'Digit3' | 'Digit4';

const MOVEMENT_DIRECTION: Record<KeyCodesMovement, DIRECTION> = {
  KeyW: 'FORWARD',
  KeyA: 'LEFT',
  KeyS: 'BACKWARD',
  KeyD: 'RIGHT',
  KeyQ: 'CAMERA_LEFT',
  KeyE: 'CAMERA_RIGHT',
};

const ACTIONS: Record<KeyCodesAction, PLAYER_ACTION> = {
  Space: 'JUMP',
  Digit1: 'ACTION1',
  Digit2: 'ACTION2',
  Digit3: 'ACTION3',
  Digit4: 'ACTION4',
};

type MovementPayload = {
  direction: DIRECTION;
  isPressed: boolean;
};

const keyDown$ = fromEvent<KeyboardEvent>(window, 'keydown');
const keyUp$ = fromEvent<KeyboardEvent>(window, 'keyup');
const blur$ = fromEvent(window, 'blur');

function keyCodeIsMovementGuard(keyCode: string): keyCode is KeyCodesMovement {
  return keyCode in MOVEMENT_DIRECTION;
}

function getDirection(keyCode: string): DIRECTION | undefined {
  if (!keyCodeIsMovementGuard(keyCode)) {
    return undefined;
  }
  return MOVEMENT_DIRECTION[keyCode];
}

function filterEmptyPayload(
  payload: MovementPayload | undefined
): payload is MovementPayload {
  return payload !== undefined;
}

function getMovementPayload(event: KeyboardEvent): MovementPayload | undefined {
  const direction = getDirection(event.code);
  if (!direction) {
    return undefined;
  }
  return {
    direction,
    isPressed: event.type === 'keydown',
  };
}

function cancelAllMovementButtons(): MovementPayload[] {
  return Object.keys(MOVEMENT_DIRECTION).map((keyCode) => ({
    direction: MOVEMENT_DIRECTION[keyCode as KeyCodesMovement],
    isPressed: false,
  }));
}

export const movementEvents$ = merge(
  merge(keyDown$, keyUp$).pipe(
    map(getMovementPayload),
    filter(filterEmptyPayload)
  ),
  blur$.pipe(mergeMap(cancelAllMovementButtons))
);

function filterActionKeycode(keyCode: string): keyCode is KeyCodesAction {
  return keyCode in ACTIONS;
}

export const actionEvents$ = keyDown$.pipe(
  map((event) => event.code),
  filter(filterActionKeycode),
  map((code) => ACTIONS[code])
  // throttleTime(500, undefined, {
  //   leading: true, // Первое событие пропускается
  //   trailing: false, // Игнорируются последующие события в интервале
  // })
);
