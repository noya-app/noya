/**
 * Imitate the internal state of a promise.
 *
 * This is useful if we want a representation of a promise-like object
 * that we can use synchronously.
 */
export type PromiseState<T> =
  | {
      type: 'pending';
    }
  | {
      type: 'success';
      value: T;
    }
  | {
      type: 'failure';
      value: Error;
    };
