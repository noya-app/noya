import React, {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { ApplicationState, WorkspaceAction, WorkspaceState } from 'noya-state';
import { useGlobalInputBlurTrigger } from 'noya-ui';
import { throttle } from 'noya-utils';

export type Dispatcher = (action: WorkspaceAction) => void;

export type FlatDispatcher = (...args: WorkspaceAction) => void;

const StateContext = createContext<WorkspaceState | undefined>(undefined);

const noop = () => {};

const DispatchContext = createContext<Dispatcher>(noop);

/**
 * We provide `state` and `dispatch` as separate contexts, to reducer re-rendering
 * for components that only need `dispatch`.
 */
export const StateProvider = memo(function StateProvider({
  state,
  dispatch,
  children,
}: {
  state: WorkspaceState;
  dispatch?: Dispatcher;
  children?: ReactNode;
}) {
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch ?? noop}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
});

/**
 * This should only be used to propagate state between React reconcilers
 */
export const useWorkspaceState = (): WorkspaceState => {
  const value = useContext(StateContext);

  // If this happens, we'll conditionally call hooks afterward
  // TODO: Is there a better solution?
  if (!value) {
    throw new Error(`Missing StateProvider`);
  }

  return value;
};

/**
 * Components should use this to update the application's state. The dispatch
 * function is referentially stable, so won't cause unnecessary re-renders.
 */
export const useDispatch = (): FlatDispatcher => {
  const dispatch = useContext(DispatchContext);
  const blurTrigger = useGlobalInputBlurTrigger();
  // Simplify the dispatch function by flattening our action tuple
  return useCallback(
    (...args: WorkspaceAction) => {
      // When changing selection, trigger any pending updates in input fields
      if (
        args[0] === 'selectLayer' ||
        args[0] === 'selectPage' ||
        args[0] === 'setTab'
      ) {
        blurTrigger();
      }
      dispatch(args);
    },
    [dispatch, blurTrigger],
  );
};

/**
 * Get the application state, and a dispatch function to modify it.
 *
 * Only "container" components should use this, while "presentational" components
 * should instead be passed their data via props.
 */

type AppStateType = [ApplicationState, FlatDispatcher];

export const useApplicationState = (): AppStateType => {
  const state = useWorkspaceState();
  const dispatch = useDispatch();

  return useMemo(
    () => [state.history.present, dispatch],
    [state.history.present, dispatch],
  );
};

export const useThrottledApplicationState = (): AppStateType => {
  const state = useWorkspaceState();
  const dispatch = useDispatch();

  const throttled = useRef(
    throttle((appState: AppStateType): AppStateType => appState, 100),
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(
    () => throttled.current([state.history.present, dispatch]),
    [state.history.present, dispatch],
  );
};

/**
 * Get a snapshot of the current state wrapped in a ref. The ref is set during
 * the `useLayoutEffect` phase of the React lifecycle.
 *
 * We do this to avoid excessively re-rendering components that need to access
 * the entire state in event handlers.
 */
export const useGetWorkspaceStateSnapshot = (): (() => WorkspaceState) => {
  const state = useWorkspaceState();

  const stateSnapshot = useRef<WorkspaceState>(state);

  useLayoutEffect(() => {
    stateSnapshot.current = state;
  }, [state]);

  return useCallback(() => stateSnapshot.current, []);
};

export const useGetStateSnapshot = (): (() => ApplicationState) => {
  const getWorkspaceStateSnapshot = useGetWorkspaceStateSnapshot();

  return useCallback(
    () => getWorkspaceStateSnapshot().history.present,
    [getWorkspaceStateSnapshot],
  );
};

export function useSelector<Projection>(
  selector: (state: ApplicationState) => Projection,
) {
  const [state] = useApplicationState();

  return useMemo(() => selector(state), [selector, state]);
}

export function useThrottledSelector<Projection>(
  selector: (state: ApplicationState) => Projection,
) {
  const [state] = useThrottledApplicationState();

  return useMemo(() => selector(state), [selector, state]);
}
