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
}
