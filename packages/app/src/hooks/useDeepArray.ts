import { useRef } from 'react';
import { shallowEqualArray } from './useShallowArray';

export function deepEqualArray<T>(a: T[], b: T[]) {
  if (shallowEqualArray(a, b)) return true;

  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Memoize an array using deep equality comparison (by converting to JSON).
 */
export default function useDeepArray<T>(array: T[]) {
  const ref = useRef(array);

  if (!deepEqualArray(ref.current, array)) {
    ref.current = array;
  }

  return ref.current;
}
