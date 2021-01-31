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

export const useApplicationState = () => {
  const value = useContext(ApplicationStateContext);

  if (!value) {
    throw new Error(`Missing ApplicationStateProvider`);
  }

  return value;
};

export function useSelector<Projection>(
  selector: (state: ApplicationState) => Projection,
) {
  const [state] = useApplicationState();

  return useMemo(() => selector(state), [selector, state]);
}
