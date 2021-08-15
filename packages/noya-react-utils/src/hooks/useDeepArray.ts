import { useRef } from 'react';
import { isDeepEqual, isShallowEqual } from 'noya-utils';

function deepEqualArray<T>(a: T[], b: T[]) {
  if (isShallowEqual(a, b)) return true;

  // return JSON.stringify(a) === JSON.stringify(b);
  return isDeepEqual(a, b);
}

/**
 * Memoize an array using deep equality comparison (by converting to JSON).
 */
export function useDeepArray<T>(array: T[]) {
  const ref = useRef(array);

  if (!deepEqualArray(ref.current, array)) {
    ref.current = array;
  }

  return ref.current;
}
