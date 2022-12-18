import { PromiseState } from './PromiseState';

export class SuspendedValue<T> {
  private suspendedPromise: Promise<void>;
  private promiseState: PromiseState<T> = { type: 'pending' };

  constructor(promise: Promise<T>) {
    this.suspendedPromise = promise
      .then((value) => {
        this.promiseState = { type: 'success', value };
      })
      .catch((value) => {
        this.promiseState = { type: 'failure', value };
      });
  }

  getValueOrThrow(): T {
    switch (this.promiseState.type) {
      case 'pending':
        throw this.suspendedPromise;
      case 'failure':
        throw this.promiseState.value;
      case 'success':
        return this.promiseState.value;
    }
  }

  /**
   * Resolve a SuspendedValue immediately, without waiting for the next
   * cycle of the event loop. Useful for synchronous tests.
   */
  static resolveInstantly<T>(value: T): SuspendedValue<T> {
    const resolved: Promise<T> = Promise.resolve(value);
    const suspended = new SuspendedValue(resolved);

    // Replace the suspended promise internals
    suspended.suspendedPromise = new Promise(() => {});
    suspended.promiseState = { type: 'success', value: value };
    return suspended;
  }
}
