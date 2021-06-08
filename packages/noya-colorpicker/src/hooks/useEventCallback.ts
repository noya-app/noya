import { useRef, useEffect, useCallback } from 'react';

// Saves incoming handler to the ref in order to avoid "useCallback hell"
function useEventCallback<T>(
  handler?: (value: T, index?: number, position?: number) => void,
): (value: T, index?: number, position?: number) => void {
  const callbackRef = useRef(handler);

  useEffect(() => {
    callbackRef.current = handler;
  });

  return useCallback(
    (value: T, index?: number, position?: number) =>
      callbackRef.current && callbackRef.current(value, index, position),
    [],
  );
}

export { useEventCallback };
