import { StateProvider } from 'noya-app-state-context';
import { isValidFontVariant } from 'noya-google-fonts';
import {
  CanvasKitProvider,
  FontManagerProvider,
  ImageCacheProvider,
  useAddFont,
  useCanvasKit,
  useFontManager,
  useTypefaceFontProvider,
} from 'noya-renderer';
import { decode, SketchFile } from 'noya-sketch-file';
import {
  createInitialWorkspaceState,
  Selectors,
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import { PromiseState } from 'noya-utils';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import Workspace from './containers/Workspace';
import { useResource } from './hooks/useResource';

type Action =
  | { type: 'set'; value: SketchFile }
  | { type: 'update'; value: WorkspaceAction };

function Contents() {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const typefaceFontProvider = useTypefaceFontProvider();

  const sketchFileData = useResource<ArrayBuffer>(
    '/Demo.sketch',
    'arrayBuffer',
  );

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
                value: workspaceReducer(
                  state.value,
                  action.value,
                  CanvasKit,
                  fontManager,
                  typefaceFontProvider,
                ),
              };
            } else {
              return state;
            }
        }
      },
    [CanvasKit, fontManager, typefaceFontProvider],
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

  const addFont = useAddFont();

  // Whenever the sketch file updates, download any new fonts
  useEffect(() => {
    if (state.type !== 'success') return;

    const fontNames = Selectors.getAllFontNames(state.value.history.present);

    fontNames.forEach((fontName) => {
      const font = Selectors.decodeFontName(fontName);

      const fontVariant =
        font.fontVariant && isValidFontVariant(font.fontVariant)
          ? font.fontVariant
          : 'regular';

      addFont(font.fontFamily, fontVariant);
    });
  }, [addFont, state]);

  if (state.type !== 'success') return null;

  return (
    <StateProvider state={state.value} dispatch={handleDispatch}>
      <ImageCacheProvider>
        <Workspace />
      </ImageCacheProvider>
    </StateProvider>
  );
}

export default function App() {
  return (
    <CanvasKitProvider>
      <FontManagerProvider>
        <Contents />
      </FontManagerProvider>
    </CanvasKitProvider>
  );
}
