import { isEqual } from './internal/isEqual';

export function isDeepEqual<T>(a: T, b: T): boolean {
  return isEqual(a, b, true, false);
}
