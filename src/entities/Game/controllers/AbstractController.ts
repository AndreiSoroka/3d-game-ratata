import type { DIRECTION, PLAYER_ACTION } from '@/entities/Game/Game';
import { Observable } from 'rxjs';

export type PlayerActionPayload = {
  action: PLAYER_ACTION;
  timestamp: number;
  cooldown: number;
};
export type MovementPayload = {
  direction: DIRECTION;
  isPressed: boolean;
};

export default abstract class AbstractController {
  public abstract readonly actionEvents$: Observable<PlayerActionPayload>;
  public abstract readonly movementEvents$: Observable<MovementPayload>;

  protected constructor() {}

  abstract destroy(): void;
}
