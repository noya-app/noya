import { useRef } from 'react';

export default function useLazyValue<T>(f: () => T): T {
  const didInitialize = useRef(false);
  const value = useRef<T | undefined>(undefined);

  if (!didInitialize.current) {
    didInitialize.current = true;

    value.current = f();
  }

  return value.current!;
}
