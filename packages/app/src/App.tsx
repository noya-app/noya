import { decode, SketchFile } from 'noya-sketch-file';
import {
  createInitialWorkspaceState,
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import { useCallback, useEffect, useReducer } from 'react';
import Workspace from './containers/Workspace';
import { StateProvider } from './contexts/ApplicationStateContext';
import { useResource } from './hooks/useResource';
import { PromiseState } from './utils/PromiseState';

type Action =
  | { type: 'set'; value: SketchFile }
  | { type: 'update'; value: WorkspaceAction };

function reducer(
  state: PromiseState<WorkspaceState>,
  action: Action,
): PromiseState<WorkspaceState> {
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
}

export default function App() {
  const sketchFileData = useResource<ArrayBuffer>(
    '/Image.sketch',
    'arrayBuffer',
  );

  const [state, dispatch] = useReducer(reducer, { type: 'pending' });

  useEffect(() => {
    decode(sketchFileData).then((parsed) => {
      dispatch({ type: 'set', value: parsed });
    });
  }, [sketchFileData]);

  const handleDispatch = useCallback((action: WorkspaceAction) => {
    dispatch({ type: 'update', value: action });
  }, []);

  if (state.type !== 'success') return null;

  return (
    <StateProvider state={state.value} dispatch={handleDispatch}>
      <Workspace />
    </StateProvider>
  );
}
