import { isEqual } from './internal/isEqual';

export function isShallowEqual<T>(a: T, b: T): boolean {
  return isEqual(a, b, false);
}
