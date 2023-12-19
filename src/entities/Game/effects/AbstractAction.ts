import { Mesh, Scene, StandardMaterial } from '@babylonjs/core';

export default abstract class AbstractAction {
  protected readonly scene: Scene;
  protected status: 'idle' | 'started' | 'ended' = 'idle';
  private readonly actionId = (~~(Math.random() * 1000000)).toString(16);
  private readonly actionPrefix: string = 'action';
  private readonly timeoutStartActionId: number | null = null;
  private readonly timeoutEndActionId: number | null = null;
  private readonly timeoutDisposeActionId: number | null = null;
  private readonly intervalLoopActionId: number | null = null;
  private disposeCallbacksFn: (() => void)[] = [];

  protected constructor(options: {
    scene: Scene;
    actionPrefix: string;
    delayStartAction: number;
    delayEndAction: number;
    delayDisposeAction?: number;
    intervalLoopAction?: number;
  }) {
    this.scene = options.scene;
    this.actionPrefix = options.actionPrefix;

    if (options.delayStartAction < 0) {
      throw new Error('delayStartAction must be greater than 0');
    }
    if (options.delayEndAction < options.delayStartAction) {
      throw new Error('delayEndAction must be greater than delayStartAction');
    }
    if (
      options.delayDisposeAction &&
      options.delayDisposeAction < options.delayEndAction
    ) {
      throw new Error('delayDisposeAction must be greater than delayEndAction');
    }

    if (options.intervalLoopAction && options.intervalLoopAction < 0) {
      throw new Error('intervalLoopAction must be greater than 0');
    }

    this.timeoutStartActionId = setTimeout(() => {
      this.startAction();
      this.status = 'started';
    }, options.delayStartAction);
    this.timeoutEndActionId = setTimeout(() => {
      this.endAction();
      this.status = 'ended';
    }, options.delayEndAction);
    this.timeoutDisposeActionId = setTimeout(
      () => this.dispose(),
      options.delayDisposeAction ?? options.delayEndAction + 1
    );
    this.intervalLoopActionId = options.intervalLoopAction
      ? setInterval(() => this.loopAction(), options.intervalLoopAction)
      : null;
  }

  protected getEventName(event: string) {
    return `${this.actionPrefix}-${event}-${this.actionId}`;
  }

  protected addDefaultMaterialToMesh(sphere: Mesh) {
    const sphereMaterial = new StandardMaterial(
      this.getEventName('material'),
      this.scene
    );
    sphereMaterial.alpha = 0;
    sphereMaterial.disableLighting = true;
    sphere.material = sphereMaterial;
  }

  abstract startAction(): void;

  abstract endAction(): void;

  abstract loopAction(): void;

  callEndActionStatus() {
    if (this.status === 'ended') {
      return;
    }
    if (this.status === 'started') {
      if (this.timeoutEndActionId) {
        clearTimeout(this.timeoutEndActionId);
      }
      this.endAction();
      this.status = 'ended';
    }
  }

  dispose() {
    if (this.timeoutStartActionId) {
      clearTimeout(this.timeoutStartActionId);
    }
    if (this.timeoutEndActionId) {
      clearTimeout(this.timeoutEndActionId);
    }
    if (this.timeoutDisposeActionId) {
      clearTimeout(this.timeoutDisposeActionId);
    }
    if (this.intervalLoopActionId) {
      clearInterval(this.intervalLoopActionId);
    }
    this.disposeCallbacksFn.forEach((callbackFn) => callbackFn());
  }

  onDispose(callbackFn: () => void) {
    this.disposeCallbacksFn.push(callbackFn);
  }
}
