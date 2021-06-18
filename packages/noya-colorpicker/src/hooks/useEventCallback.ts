import { useRef, useEffect, useCallback } from 'react';

// Saves incoming handler to the ref in order to avoid "useCallback hell"
function useEventCallback<T extends any[]>(
  handler?: (...values: T) => void,
): (...values: T) => void {
  const callbackRef = useRef(handler);

  useEffect(() => {
    callbackRef.current = handler;
  });

  return useCallback(
    (...values: T) => callbackRef.current && callbackRef.current(...values),
    [],
  );
}

export { useEventCallback };