import {
  actionsCoolDown,
  type DIRECTION,
  type PLAYER_ACTION,
} from '@/entities/Game/Game';
import {
  merge,
  filter,
  fromEvent,
  map,
  Subscription,
  mergeMap,
  distinctUntilChanged,
  scan,
} from 'rxjs';
import AbstractController, {
  type PlayerActionPayload,
} from '@/entities/Game/controllers/AbstractController';

type BindActionsKeys = Record<string, PLAYER_ACTION>;
type BindDoubleActionsKeys = Record<string, PLAYER_ACTION>;
type BindDirectionKeys = Record<string, DIRECTION>;

export const DEFAULT_DIRECTION_KEYS: BindDirectionKeys = {
  KeyW: 'FORWARD',
  KeyA: 'LEFT',
  KeyS: 'BACKWARD',
  KeyD: 'RIGHT',
  KeyQ: 'CAMERA_LEFT',
  KeyE: 'CAMERA_RIGHT',
};
export const DEFAULT_ACTIONS_KEYS: BindActionsKeys = {
  Space: 'JUMP',
  Digit1: 'ACTION1',
  Digit2: 'ACTION2',
  Digit3: 'ACTION3',
  Digit4: 'ACTION4',
};
export const DEFAULT_DOUBLE_ACTIONS_KEYS: BindDoubleActionsKeys = {
  KeyW: 'ACTION5',
};

const DOUBLE_PRESS_INTERVAL: number = 200;

export default class KeyBoardController extends AbstractController {
  private readonly _bindDirectionKeys = DEFAULT_DIRECTION_KEYS;
  private readonly _bindActionsKeys = DEFAULT_ACTIONS_KEYS;
  private readonly _bindDoubleActionsKeys = DEFAULT_DOUBLE_ACTIONS_KEYS;

  private _pressedKeys = new Map<string, boolean>();
  private _keyDown$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
    filter((event) => !event.repeat)
  );
  private _keyUp$ = fromEvent<KeyboardEvent>(window, 'keyup');
  private _blur$ = fromEvent(window, 'blur');
  private _doubleKeyPress$ = merge(this._keyDown$).pipe(
    scan(
      (acc, event) => ({
        wasDoublePress:
          acc.wasDoublePress === event.code ||
          acc.lastEvent?.code !== event.code ||
          event.timeStamp - acc.lastEvent.timeStamp > DOUBLE_PRESS_INTERVAL
            ? null
            : event.code,
        lastEvent: event,
      }),
      {
        wasDoublePress: null as string | null,
        lastEvent: null as KeyboardEvent | null,
      }
    ),
    filter(
      (
        payload
      ): payload is {
        wasDoublePress: string;
        lastEvent: KeyboardEvent;
      } => payload.wasDoublePress !== null && payload.lastEvent !== null
    ),
    map((payload) => payload.lastEvent)
  );
  private _subscribers: Set<Subscription> = new Set();

  public readonly actionEvents$ = merge(
    this._keyDown$.pipe(
      filter((event) => event.code in this._bindActionsKeys),
      map((event) => ({
        event,
        action: this._bindActionsKeys[event.code],
      }))
    ),
    this._doubleKeyPress$.pipe(
      filter((event) => event.code in this._bindDoubleActionsKeys),
      map((event) => ({
        event,
        action: this._bindDoubleActionsKeys[event.code],
      }))
    )
  ).pipe(
    scan(
      (acc, payload) => {
        const now = Date.now();
        const lastActionTime = acc.state[payload.action] || 0;
        const cooldown = actionsCoolDown[payload.action];

        if (now - lastActionTime >= cooldown) {
          return {
            state: { ...acc.state, [payload.action]: now },
            payload: {
              action: payload.action,
              timestamp: now,
              cooldown: cooldown,
            },
          };
        }
        return { ...acc, payload: null };
      },
      {
        state: {} as Record<string, number>,
        payload: null as PlayerActionPayload | null,
      }
    ),
    map((acc) => acc.payload),
    filter((payload): payload is PlayerActionPayload => !!payload)
  );

  public readonly movementEvents$ = merge(
    this._keyDown$,
    this._keyUp$,
    this._blur$.pipe(
      mergeMap(() => this._pressedKeys),
      filter(([key]) => key in this._bindDirectionKeys),
      map(([key]) => key)
    )
  ).pipe(
    map((eventOrKeyCode): string => {
      if (eventOrKeyCode instanceof KeyboardEvent) {
        return eventOrKeyCode.code;
      }
      return eventOrKeyCode;
    }),
    filter((keyCode) => keyCode in this._bindDirectionKeys),
    map((keyCode) => ({
      direction: this._bindDirectionKeys[keyCode],
      isPressed: !!this._pressedKeys.get(keyCode),
    })),
    distinctUntilChanged(
      (prev, curr) =>
        prev.direction === curr.direction && prev.isPressed === curr.isPressed
    )
  );

  constructor(payload?: {
    bindDirectionKeys?: BindDirectionKeys;
    bindActionsKeys?: BindActionsKeys;
    bindDoubleActionsKeys?: BindDoubleActionsKeys;
  }) {
    super();
    if (payload?.bindDirectionKeys) {
      this._bindDirectionKeys = payload.bindDirectionKeys;
    }
    if (payload?.bindActionsKeys) {
      this._bindActionsKeys = payload.bindActionsKeys;
    }
    if (payload?.bindDoubleActionsKeys) {
      this._bindDoubleActionsKeys = payload.bindDoubleActionsKeys;
    }

    const keyDown = this._keyDown$.subscribe((event) => {
      if (!this._pressedKeys.get(event.code)) {
        this._pressedKeys.set(event.code, true);
      }
    });
    this._subscribers.add(keyDown);

    const keyUp = this._keyUp$.subscribe((event) => {
      this._pressedKeys.set(event.code, false);
    });
    this._subscribers.add(keyUp);

    const blur = this._blur$.subscribe(() => {
      this._pressedKeys.forEach((_, key) => {
        this._pressedKeys.set(key, false);
      });
    });
    this._subscribers.add(blur);
  }

  destroy(): void {
    this._subscribers.forEach((subscriber) => subscriber.unsubscribe());
    this._subscribers.clear();
  }
}
