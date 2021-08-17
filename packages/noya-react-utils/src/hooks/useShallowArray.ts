import { useRef } from 'react';
import { isShallowEqual } from 'noya-utils';

/**
 * Memoize an array using shallow comparison.
 */
export function useShallowArray<T>(array: T[]) {
  const ref = useRef(array);

  if (!isShallowEqual(ref.current, array)) {
    ref.current = array;
  }

  return ref.current;
}
