import { decode, SketchFile } from 'noya-sketch-file';
import {
  createInitialWorkspaceState,
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import Workspace from './containers/Workspace';
import {
  ApplicationStateContextValue,
  ApplicationStateProvider,
} from './contexts/ApplicationStateContext';
import { useResource } from './hooks/useResource';
import { PromiseState } from './utils/PromiseState';

export default function App() {
  const sketchFileData = useResource<ArrayBuffer>(
    '/Demo.sketch',
    'arrayBuffer',
  );

  const [state, dispatch] = useReducer(
    (
      state: PromiseState<WorkspaceState>,
      action:
        | { type: 'set'; value: SketchFile }
        | { type: 'update'; value: WorkspaceAction },
    ): PromiseState<WorkspaceState> => {
      switch (action.type) {
        case 'set':
          return {
            type: 'success',
            value: createInitialWorkspaceState(action.value),
          };
        case 'update':
          if (state.type === 'success') {
            return {
              type: 'success',
              value: workspaceReducer(state.value, action.value),
            };
          } else {
            return state;
          }
      }
    },
    { type: 'pending' },
  );

  useEffect(() => {
    decode(sketchFileData).then((parsed) => {
      dispatch({ type: 'set', value: parsed });
    });
  }, [sketchFileData]);

  const handleDispatch = useCallback((action: WorkspaceAction) => {
    dispatch({ type: 'update', value: action });
  }, []);

  const contextValue: ApplicationStateContextValue | undefined = useMemo(
    () =>
      state.type === 'success' ? [state.value, handleDispatch] : undefined,
    [state, handleDispatch],
  );

  if (!contextValue) return null;

  return (
    <ApplicationStateProvider value={contextValue}>
      <Workspace />
    </ApplicationStateProvider>
  );
}
