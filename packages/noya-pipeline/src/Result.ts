export type Result<T> =
  | { type: 'success'; value: T }
  | { type: 'error'; error: Error };

export function error<T>(value: Error): Result<T> {
  return { type: 'error', error: value };
}

export function success<T>(value: T): Result<T> {
  return { type: 'success', value };
}
