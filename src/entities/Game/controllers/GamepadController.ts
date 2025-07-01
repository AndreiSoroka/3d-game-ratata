import { fromEvent, Subject } from 'rxjs';
import AbstractController, {
  type PlayerActionPayload,
  type MovementPayload,
} from '@/entities/Game/controllers/AbstractController';
import type { DIRECTION, PLAYER_ACTION } from '@/entities/Game/Game';
import {
  decodeHat,
  HAT_EPSILON,
  type HatDirection,
} from './GamepadController.utils';

export const GAMEPAD_AXES = {
  LEFT_STICK_X: 0,
  LEFT_STICK_Y: 1,
  RIGHT_STICK_X: 2,
  RIGHT_STICK_Y: 3,
} as const;

export const GAMEPAD_BUTTONS = {
  X: 0,
  O: 1,
  SQUARE: 2,
  TRIANGLE: 3,
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  SHARE: 8,
  OPTIONS: 9,
  L3: 10,
  R3: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
  PS: 16,
  TOUCH: 17,
} as const;

export type BindDirectionControls = {
  axisX: number;
  axisY: number;
  axisCamera: number;
};

export type BindDirectionKeys = Partial<
  Record<keyof typeof GAMEPAD_BUTTONS, DIRECTION>
>;
export type BindActionButtons = Partial<
  Record<keyof typeof GAMEPAD_BUTTONS, PLAYER_ACTION>
>;

export const DEFAULT_DIRECTION_CONTROLS: BindDirectionControls = {
  axisX: GAMEPAD_AXES.LEFT_STICK_X,
  axisY: GAMEPAD_AXES.LEFT_STICK_Y,
  axisCamera: GAMEPAD_AXES.RIGHT_STICK_X,
};

export const DEFAULT_DIRECTION_KEYS: BindDirectionKeys = {
  DPAD_UP: 'FORWARD',
  DPAD_DOWN: 'BACKWARD',
  DPAD_LEFT: 'LEFT',
  DPAD_RIGHT: 'RIGHT',
  X: 'JUMP',
} as const;

export const DEFAULT_ACTION_BUTTONS: BindActionButtons = {
  SQUARE: 'ACTION1',
  O: 'ACTION2',
  TRIANGLE: 'ACTION3',
  R1: 'ACTION4',
  R2: 'ACTION5',
};

const DEFAULT_THRESHOLD = 0.3;
const POLL_INTERVAL = 16;

interface DirectionState {
  pressed: boolean;
  speed: number;
}

export default class GamepadController extends AbstractController {
  private _bindDirectionControls = DEFAULT_DIRECTION_CONTROLS;
  private _bindDirectionKeys = DEFAULT_DIRECTION_KEYS;
  private _bindActionButtons = DEFAULT_ACTION_BUTTONS;
  private _threshold = DEFAULT_THRESHOLD;

  private _gamepadIndex: number | null = null;
  private _intervalId = 0;
  private _buttonState = new Map<string, boolean>();
  private _directionState = new Map<
    MovementPayload['direction'],
    DirectionState
  >();
  private readonly _actionSubject = new Subject<PlayerActionPayload>();
  private readonly _movementSubject = new Subject<MovementPayload>();

  public readonly actionEvents$ = this._actionSubject.asObservable();
  public readonly movementEvents$ = this._movementSubject.asObservable();

  constructor(payload?: {
    bindDirectionControls?: BindDirectionControls;
    bindDirectionKeys?: BindDirectionKeys;
    bindActionButtons?: BindActionButtons;
    threshold?: number;
  }) {
    super();
    if (payload?.bindDirectionControls) {
      this._bindDirectionControls = payload.bindDirectionControls;
    }
    if (payload?.bindDirectionKeys) {
      this._bindDirectionKeys = payload.bindDirectionKeys;
    }
    if (payload?.bindActionButtons) {
      this._bindActionButtons = payload.bindActionButtons;
    }
    if (payload?.threshold !== undefined) {
      this._threshold = payload.threshold;
    }

    fromEvent<GamepadEvent>(window, 'gamepadconnected').subscribe((event) => {
      if (this._gamepadIndex === null) {
        this._gamepadIndex = event.gamepad.index;
        this._startLoop();
      }
    });

    fromEvent<GamepadEvent>(window, 'gamepaddisconnected').subscribe(
      (event) => {
        if (this._gamepadIndex === event.gamepad.index) {
          this._gamepadIndex = null;
          clearInterval(this._intervalId);
        }
      }
    );
  }

  destroy(): void {
    clearInterval(this._intervalId);
    this._actionSubject.complete();
    this._movementSubject.complete();
  }

  private _startLoop() {
    this._intervalId = window.setInterval(() => this._poll(), POLL_INTERVAL);
  }

  private _updateDirection(
    direction: MovementPayload['direction'],
    pressed: boolean,
    speed: number
  ) {
    const prev = this._directionState.get(direction);
    if (
      !prev ||
      prev.pressed !== pressed ||
      Math.abs(prev.speed - speed) > 0.05
    ) {
      this._movementSubject.next({ direction, isPressed: pressed, speed });
      this._directionState.set(direction, { pressed, speed });
    }
  }

  private _normalizeAxis(val: number): number {
    return Math.min(
      1,
      (Math.abs(val) - this._threshold) / (1 - this._threshold)
    );
  }

  private _poll() {
    if (this._gamepadIndex === null) {
      return;
    }
    const gamepad = navigator.getGamepads()[this._gamepadIndex];
    if (!gamepad) {
      return;
    }

    const { axisX, axisY, axisCamera } = this._bindDirectionControls;
    const lx = gamepad.axes[axisX] ?? 0;
    const ly = gamepad.axes[axisY] ?? 0;
    const rx = gamepad.axes[axisCamera] ?? 0;

    const speeds: Record<DIRECTION, number> = {
      FORWARD: ly < -this._threshold ? this._normalizeAxis(ly) : 0,
      BACKWARD: ly > this._threshold ? this._normalizeAxis(ly) : 0,
      LEFT: lx < -this._threshold ? this._normalizeAxis(lx) : 0,
      RIGHT: lx > this._threshold ? this._normalizeAxis(lx) : 0,
      JUMP: 0,
      CAMERA_LEFT: rx < -this._threshold ? this._normalizeAxis(rx) : 0,
      CAMERA_RIGHT: rx > this._threshold ? this._normalizeAxis(rx) : 0,
    };

    const buttonPressed = (name: keyof typeof GAMEPAD_BUTTONS) => {
      const index = GAMEPAD_BUTTONS[name];
      return !!gamepad.buttons[index]?.pressed;
    };

    Object.entries(this._bindDirectionKeys).forEach(([key, direction]) => {
      if (buttonPressed(key as keyof typeof GAMEPAD_BUTTONS)) {
        speeds[direction] = Math.max(speeds[direction] || 0, 1);
      }
    });

    if (
      speeds.FORWARD === 0 &&
      speeds.BACKWARD === 0 &&
      speeds.LEFT === 0 &&
      speeds.RIGHT === 0
    ) {
      const hat = gamepad.axes[9] ?? gamepad.axes[10];
      if (hat !== undefined) {
        const d: HatDirection = decodeHat(hat, HAT_EPSILON);
        if (d.up) speeds.FORWARD = 1;
        if (d.down) speeds.BACKWARD = 1;
        if (d.left) speeds.LEFT = 1;
        if (d.right) speeds.RIGHT = 1;
      }
    }

    Object.entries(this._bindActionButtons).forEach(([key, action]) => {
      const pressed = buttonPressed(key as keyof typeof GAMEPAD_BUTTONS);
      const prev = this._buttonState.get(key);
      if (pressed && !prev) {
        this._actionSubject.next(action);
      }
      this._buttonState.set(key, pressed);
    });

    (Object.keys(speeds) as Array<DIRECTION>).forEach((dir) => {
      const speed = speeds[dir];
      this._updateDirection(dir, speed > 0, speed);
    });
  }
}
