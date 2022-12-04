import { isDeepEqual } from 'noya-utils';
import { useRef } from 'react';

/**
 * Memoize an array using deep equality comparison (by converting to JSON).
 */
export function useDeepMemo<T>(array: T) {
  const ref = useRef(array);

  if (!isDeepEqual(ref.current, array)) {
    ref.current = array;
  }

  return ref.current;
}
