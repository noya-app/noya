import { decode, SketchFile } from 'noya-sketch-file';
import {
  createInitialWorkspaceState,
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import { PromiseState } from 'noya-utils';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { FontManagerProvider, ImageCacheProvider } from 'noya-renderer';
import Workspace from './containers/Workspace';
import { StateProvider } from './contexts/ApplicationStateContext';
import { useCanvasKit } from 'noya-renderer';
import { useResource } from './hooks/useResource';

type Action =
  | { type: 'set'; value: SketchFile }
  | { type: 'update'; value: WorkspaceAction };

export default function App() {
  const sketchFileData = useResource<ArrayBuffer>(
    '/Demo.sketch',
    'arrayBuffer',
  );
  const CanvasKit = useCanvasKit();

  const reducer = useMemo(
    () =>
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
                value: workspaceReducer(state.value, action.value, CanvasKit),
              };
            } else {
              return state;
            }
        }
      },
    [CanvasKit],
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
      <ImageCacheProvider>
        <FontManagerProvider>
          <Workspace />
        </FontManagerProvider>
      </ImageCacheProvider>
    </StateProvider>
  );
}
