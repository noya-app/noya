import { useRef } from 'react';

export function shallowEqualArray<T>(a: T[], b: T[]) {
  if (a === b) return true;

  const length = a.length;

  if (b.length !== length) return false;

  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Memoize an array using shallow comparison.
 */
export default function useShallowArray<T>(array: T[]) {
  const ref = useRef(array);

  if (!shallowEqualArray(ref.current, array)) {
    ref.current = array;
  }

  return ref.current;
}
