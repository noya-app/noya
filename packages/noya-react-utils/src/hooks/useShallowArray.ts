import { isShallowEqual } from '@noya-app/noya-utils';
import { useRef } from 'react';

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
