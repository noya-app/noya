import { useRef } from 'react';
import { isShallowEqualArray } from '../utils/shallowEqual';

/**
 * Memoize an array using shallow comparison.
 */
export default function useShallowArray<T>(array: T[]) {
  const ref = useRef(array);

  if (!isShallowEqualArray(ref.current, array)) {
    ref.current = array;
  }

  return ref.current;
}
