import { useCallback, useMemo, useState } from 'react';
import { useLazyValue } from './useLazyValue';

export function useMutableState<T extends object>(
  valueOrInitializer: T | (() => T),
) {
  const mutableValue = useLazyValue(() =>
    typeof valueOrInitializer === 'function'
      ? valueOrInitializer()
      : valueOrInitializer,
  );

  // We create a proxy wrapper in order to re-render on changes
  const [wrappedValue, setWrappedValue] = useState(
    () => new Proxy(mutableValue, {}),
  );

  const updateValue = useCallback(
    (updater: (value: T) => void) => {
      updater(mutableValue);

      setWrappedValue(new Proxy(mutableValue, {}));
    },
    // The mutable value is a dependency to satisfy eslint,
    // but should never change identity
    [mutableValue],
  );

  return useMemo(
    () => [wrappedValue, updateValue] as const,
    [updateValue, wrappedValue],
  );
}
