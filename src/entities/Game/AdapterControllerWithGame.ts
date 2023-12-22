import type AbstractController from '@/entities/Game/controllers/AbstractController';
import type Game from '@/entities/Game/Game';

export default function AdapterControllerWithGame(
  ControllerClass: new () => AbstractController,
  game: Game
): { destroy: () => void } {
  const controller = new ControllerClass();

  const actionEvents = controller.actionEvents$.subscribe((payload) => {
    game.callPlayerAction(payload);
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
