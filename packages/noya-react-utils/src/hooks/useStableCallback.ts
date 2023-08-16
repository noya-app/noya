import { useCallback, useLayoutEffect, useRef } from 'react';

const noop = () => {};

export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
): T;
export function useStableCallback<T extends (...args: any[]) => any>(
  callback?: T,
): T | ((...args: Parameters<T>) => void);
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
): T {
  const callbackRef = useRef(callback || noop);

  useLayoutEffect(() => {
    callbackRef.current = callback || noop;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>): ReturnType<T> => callbackRef.current(...args),
    [callbackRef],
  ) as T;
}
