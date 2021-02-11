import { useMemo } from 'react';

/**
 * Memoize an array using shallow comparison.
 */
export default function useShallowArray<T>(array: T[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => array, array);
}
