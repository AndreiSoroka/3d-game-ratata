import type AbstractController from '@/entities/Game/controllers/AbstractController';
import { type PlayerActionPayload } from '@/entities/Game/controllers/AbstractController';
import type Game from '@/entities/Game/Game';

export default function AdapterControllerWithGame(
  ControllerClass: new () => AbstractController,
  game: Game,
  options?: {
    actionsFn?: (payload: PlayerActionPayload) => void;
  }
): { destroy: () => void } {
  const controller = new ControllerClass();

  const actionEvents = controller.actionEvents$.subscribe((payload) => {
    options?.actionsFn?.(payload);
    game.callPlayerAction(payload.action);
  });

  const movementEvents = controller.movementEvents$.subscribe((payload) => {
    game.setPlayerDirection(payload.direction, payload.isPressed);
  });

  return {
    destroy() {
      actionEvents.unsubscribe();
      movementEvents.unsubscribe();
      controller.destroy();
    },
  };
}


// if (payload.action === 'ACTION1') {
//   if (buttonAction1Timestamp.value + COOLDOWN_ACTION1 > Date.now()) {
//     return;
//   }
//   buttonAction1Timestamp.value = Date.now();
// }
// if (payload === 'ACTION2') {
//   if (buttonAction2Timestamp.value + COOLDOWN_ACTION2 > Date.now()) {
//     return;
//   }
//   buttonAction2Timestamp.value = Date.now();
// }
// if (payload === 'ACTION3') {
//   if (buttonAction3Timestamp.value + COOLDOWN_ACTION3 > Date.now()) {
//     return;
//   }
//   buttonAction3Timestamp.value = Date.now();
// }
// if (payload === 'ACTION4') {
//   if (buttonAction4Timestamp.value + COOLDOWN_ACTION4 > Date.now()) {
//     return;
//   }
//   buttonAction4Timestamp.value = Date.now();
// }
// if (payload === 'ACTION5') {
//   if (buttonAction5Timestamp.value + COOLDOWN_ACTION5 > Date.now()) {
//     return;
//   }
//   buttonAction5Timestamp.value = Date.now();
// }