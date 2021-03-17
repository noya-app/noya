import { Action, ApplicationState } from 'noya-state';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { useGlobalInputBlurTrigger } from 'noya-designsystem';

export type ApplicationStateContextValue = [
  ApplicationState,
  (action: Action) => void,
];

const ApplicationStateContext = createContext<
  ApplicationStateContextValue | undefined
>(undefined);

export const ApplicationStateProvider = ApplicationStateContext.Provider;

type Dispatcher = (...args: Action) => void;

export const useApplicationState = (): [ApplicationState, Dispatcher] => {
  const value = useContext(ApplicationStateContext);
  const trigger = useGlobalInputBlurTrigger();

  if (!value) {
    throw new Error(`Missing ApplicationStateProvider`);
  }

  const [state, dispatch] = value;

  // Simplify the dispatch function by flattening our Action tuple
  const wrappedDispatch: Dispatcher = useCallback(
    (...args: Action) => {
      // When changing selection, trigger any pending updates in input fields
      if (
        args[0] === 'selectLayer' ||
        args[0] === 'selectPage' ||
        args[0] === 'setTab'
      ) {
        trigger();
      }

      dispatch(args);
    },
    [dispatch, trigger],
  );

  const wrapped: [ApplicationState, Dispatcher] = useMemo(() => {
    return [state, wrappedDispatch];
  }, [state, wrappedDispatch]);

  return wrapped;
};

export function useSelector<Projection>(
  selector: (state: ApplicationState) => Projection,
) {
  const [state] = useApplicationState();

  return useMemo(() => selector(state), [selector, state]);
}
