import type { DIRECTION, PLAYER_ACTION } from '@/entities/Game/Game';
import { Observable } from 'rxjs';

export type PlayerActionPayload = PLAYER_ACTION;
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
