import { useMemo } from 'react';

export default function useStable4ElementArray(
  value: Float32Array,
): Float32Array;
export default function useStable4ElementArray(
  value: Float32Array | undefined,
): Float32Array | undefined;
export default function useStable4ElementArray(
  value: Float32Array | undefined,
): Float32Array | undefined {
  return useMemo(
    () => value,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value?.[0], value?.[1], value?.[2], value?.[3]],
  );
}
