import { useEffect, useMemo, useReducer } from 'react';

import {
  createInitialWorkspaceState,
  createSketchFile,
  WorkspaceState,
  WorkspaceAction,
  workspaceReducer,
} from 'noya-state';
import { useCanvasKit } from 'noya-renderer';
import { PromiseState } from 'noya-react-utils';
import { SketchFile } from 'noya-sketch-file';
import { useFontManager } from 'noya-renderer';

type Action =
  | { type: 'set'; value: SketchFile }
  | { type: 'update'; value: WorkspaceAction };

export default function useAppState() {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();

  const reducer = useMemo(
    () =>
      function appReducer(
        state: PromiseState<WorkspaceState>,
        action: Action,
      ): PromiseState<WorkspaceState> {
        if (action.type === 'set') {
          return {
            type: 'success',
            value: createInitialWorkspaceState(action.value),
          };
        }

        if (state.type === 'success') {
          return {
            type: 'success',
            value: workspaceReducer(
              state.value,
              action.value,
              CanvasKit,
              fontManager,
            ),
          };
        }

        return state;
      },
    [CanvasKit, fontManager],
  );

  const [state, dispatch] = useReducer(reducer, { type: 'pending' });

  useEffect(() => {
    if (state.type === 'success') return;
    // TODO: Load file

    dispatch({ type: 'set', value: createSketchFile() });
  }, [state.type]);

  // TODO: Download new fonts effect

  return { state, dispatch };
}
