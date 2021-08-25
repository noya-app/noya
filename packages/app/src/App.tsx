import { StateProvider } from 'noya-app-state-context';
import { decodeFontName } from 'noya-fonts';
import {
  CanvasKitProvider,
  FontManagerProvider,
  ImageCacheProvider,
  useCanvasKit,
  useDownloadFont,
  useFontManager,
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
import {
  EnvironmentParameters,
  EnvironmentParametersProvider,
} from './hooks/useEnvironmentParameters';
import { useResource } from './hooks/useResource';
import {
  castHashParameter,
  useUrlHashParameters,
} from './hooks/useUrlHashParameters';

type Action =
  | { type: 'set'; value: SketchFile }
  | { type: 'update'; value: WorkspaceAction };

function Contents() {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();

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
                ),
              };
            } else {
              return state;
            }
        }
      },
    [CanvasKit, fontManager],
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

  const downloadFont = useDownloadFont();

  // Whenever the sketch file updates, download any new fonts
  useEffect(() => {
    if (state.type !== 'success') return;

    const fontNames = Selectors.getAllFontNames(state.value.history.present);

    fontNames.forEach((fontName) => {
      const { fontFamily, fontTraits } = decodeFontName(fontName);
      const fontFamilyId = fontManager.getFontFamilyId(fontFamily);

      if (!fontFamilyId) return;

      downloadFont({ fontFamilyId, ...fontTraits });
    });
  }, [downloadFont, fontManager, state]);

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
  const urlHashParameters = useUrlHashParameters();
  const environmentParameters = useMemo(
    (): EnvironmentParameters => ({
      isElectron: castHashParameter(urlHashParameters.isElectron, 'boolean'),
    }),
    [urlHashParameters.isElectron],
  );

  return (
    <EnvironmentParametersProvider value={environmentParameters}>
      <CanvasKitProvider>
        <FontManagerProvider>
          <Contents />
        </FontManagerProvider>
      </CanvasKitProvider>
    </EnvironmentParametersProvider>
  );
}
