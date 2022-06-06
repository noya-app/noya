import { useRef, useEffect, MutableRefObject } from 'react';

import { throttle } from 'noya-utils';

const DefaultThrottle = 8.33; // 120fps

export function useThrottledFunction<T extends Function>(
  func: T,
  by: number = DefaultThrottle,
): MutableRefObject<T> {
  const funcRef = useRef(throttle(func, by));

  useEffect(() => {
    funcRef.current = throttle(func, by);
  }, [func, by]);

  return funcRef;
}
