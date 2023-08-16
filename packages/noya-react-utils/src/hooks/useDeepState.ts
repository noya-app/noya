import { isDeepEqual } from 'noya-utils';
import { useCallback, useMemo, useState } from 'react';

export const useDeepState: typeof useState = (
  ...args: Parameters<typeof useState>
) => {
  const [state, _setState] = useState(...args);

  const setState = useCallback(function updater(updated) {
    _setState((current) => {
      if (isDeepEqual(current, updated)) return current;
      return updated;
    });
  }, []);

  return useMemo(() => [state, setState], [state, setState]);
};
