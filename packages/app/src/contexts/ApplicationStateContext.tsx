import { ApplicationState, HistoryAction, HistoryState } from 'noya-state';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { useGlobalInputBlurTrigger } from 'noya-designsystem';

export type ApplicationStateContextValue = [
  HistoryState,
  (action: HistoryAction) => void,
];

const ApplicationStateContext = createContext<
  ApplicationStateContextValue | undefined
>(undefined);

export const ApplicationStateProvider = ApplicationStateContext.Provider;

type Dispatcher = (...args: HistoryAction) => void;

/**
 * This should only be used to propagate state between React reconcilers
 */
export const useRawApplicationState = (): ApplicationStateContextValue => {
  const value = useContext(ApplicationStateContext);

  // If this happens, we'll conditionally call hooks afterward
  // TODO: Is there a better solution?
  if (!value) {
    throw new Error(`Missing ApplicationStateProvider`);
  }

  return value;
};

/**
 * Get the application state, and a dispatch function to modify it.
 *
 * Only "container" components should use this, while "presentational" components
 * should instead be passed their data via props.
 */
export const useApplicationState = (): [
  ApplicationState & { undoDisabled: boolean; redoDisabled: boolean },
  Dispatcher,
] => {
  const value = useRawApplicationState();
  const trigger = useGlobalInputBlurTrigger();

  const [state, dispatch] = value;

  // Simplify the dispatch function by flattening our Action tuple
  const wrappedDispatch: Dispatcher = useCallback(
    (...args: HistoryAction) => {
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

  const wrapped: [
    ApplicationState & { undoDisabled: boolean; redoDisabled: boolean },
    Dispatcher,
  ] = useMemo(() => {
    return [
      {
        ...state.present,
        undoDisabled: state.past.length === 0,
        redoDisabled: state.future.length === 0,
      },
      wrappedDispatch,
    ];
  }, [state, wrappedDispatch]);

  return wrapped;
};

export function useSelector<Projection>(
  selector: (state: ApplicationState) => Projection,
) {
  const [state] = useApplicationState();

  return useMemo(() => selector(state), [selector, state]);
}
