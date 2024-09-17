export class PromiseWrapper<Result = void> {
  private readonly _promise: Promise<Result>;
  public resolve!: (result: Result) => void;
  public reject!: (error: Error) => void;

  public then!: Promise<Result>['then'];
  public catch!: Promise<Result>['catch'];
  public finally!: Promise<Result>['finally'];

  constructor() {
    this._promise = new Promise<Result>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.then = this._promise.then.bind(this._promise);
    this.catch = this._promise.catch.bind(this._promise);
    this.finally = this._promise.finally.bind(this._promise);
  }
}
