import { Action, ApplicationState } from 'ayano-state';
import { createContext, useContext, useMemo } from 'react';

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

  if (!value) {
    throw new Error(`Missing ApplicationStateProvider`);
  }

  // Simplify the dispatch function by flattening our Action tuple
  const wrapped: [ApplicationState, Dispatcher] = useMemo(() => {
    return [value[0], (...args: Action) => value[1](args)];
  }, [value]);

  return wrapped;
};

export function useSelector<Projection>(
  selector: (state: ApplicationState) => Projection,
) {
  const [state] = useApplicationState();

  return useMemo(() => selector(state), [selector, state]);
}
