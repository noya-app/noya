import { IsEqualOptions, isEqual } from './internal/isEqual';

export function isDeepEqual<T>(a: T, b: T, options?: IsEqualOptions): boolean {
  return isEqual(a, b, true, options);
}
