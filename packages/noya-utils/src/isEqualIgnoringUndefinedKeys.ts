import { isEqual } from './internal/isEqual';

export function isEqualIgnoringUndefinedKeys<T>(a: T, b: T): boolean {
  return isEqual(a, b, true, true);
}
