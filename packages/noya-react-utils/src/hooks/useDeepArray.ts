import { useRef } from 'react';
import { isDeepEqual, isShallowEqual } from 'noya-utils';

function deepEqualArray<T>(a: T[], b: T[]) {
  // TODO: This shallow comparison probably shouldn't be here.
  // The behavior could be different, in the case where a mutable
  // object was passed accidentally. But we'll need to test that
  // we're not relying on this behavior.
  if (isShallowEqual(a, b)) return true;

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
