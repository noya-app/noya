import {
  createInitialWorkspaceState,
  createSketchFile,
  WorkspaceState,
  WorkspaceAction,
  workspaceReducer,
} from 'noya-state';
import { useCanvasKit } from 'noya-renderer';
import { useEffect, useMemo, useReducer } from 'react';
import { PromiseState } from 'noya-react-utils';
import { SketchFile } from 'noya-sketch-file';
import { IFontManager } from 'noya-renderer';

type Action =
  | { type: 'set'; value: SketchFile }
  | { type: 'update'; value: WorkspaceAction };

class FontManagerStub {
  getFontId() {
    // eslint-ignore-next-line
    console.log(Function.name);
  }
  getBeestFontDescriptor() {
    // eslint-ignore-next-line
    console.log(Function.name);
  }
  downloadFont() {
    // eslint-ignore-next-line
    console.log(Function.name);
  }
  get entries() {
    // eslint-ignore-next-line
    console.log(Function.name);
    return [];
  }

  get values() {
    // eslint-ignore-next-line
    console.log(Function.name);
    return [];
  }
}

// @ts-ignore
const fontManager = new FontManagerStub() as IFontManager;

export default function useAppState() {
  // TODO: create app start params povider
  const CanvasKit = useCanvasKit();

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
    // TODO: add fontManager when implemented
    [CanvasKit],
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
