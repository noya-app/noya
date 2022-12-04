import { StateProvider } from 'noya-app-state-context';
import { decodeFontName } from 'noya-fonts';
import { getCurrentPlatform, PlatformName } from 'noya-keymap';
import {
  MultiplayerProvider,
  useAutoJoinChannel,
  useMultiplayer,
  useMultiplayerStateJSON,
} from 'noya-multiplayer';
import { PromiseState } from 'noya-react-utils';
import {
  CanvasKitProvider,
  FontManagerProvider,
  ImageCacheProvider,
  useCanvasKit,
  useDownloadFont,
  useFontManager,
} from 'noya-renderer';
import { SketchFile } from 'noya-sketch-file';
import {
  createInitialWorkspaceState,
  createSketchFile,
  Selectors,
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import Workspace from './containers/Workspace';
import {
  EnvironmentParameters,
  EnvironmentParametersProvider,
} from './hooks/useEnvironmentParameters';
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

  // useEffect(() => {
  //   if (state.type === 'success') return;

  //   async function loadFile() {
  //     const file = await fileManager.open({ path: documentPath });
  //     const data = await file.arrayBuffer();
  //     const sketch = await decode(data);

  //     dispatch({ type: 'set', value: sketch });
  //     dispatch({ type: 'update', value: ['setFileHandle', file.handle] });
  //   }

  //   if (documentPath) {
  //     loadFile();
  //   } else {
  //     dispatch({ type: 'set', value: createSketchFile() });
  //   }
  // }, [documentPath, state.type]);

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

  const { join, channels } = useMultiplayer();
  const isMember = useAutoJoinChannel('root');
  const [sharedDocument, setSharedDocument] =
    useMultiplayerStateJSON<SketchFile>('root', 'document');
  const didInitialize = useRef(false);

  // Load shared document if one exists, or create one
  useEffect(() => {
    if (!isMember) return;
    if (sharedDocument) {
      if (!didInitialize.current) {
        dispatch({ type: 'set', value: sharedDocument });
        didInitialize.current = true;
      }
      return;
    }

    const initialFile = createSketchFile();

    dispatch({ type: 'set', value: initialFile });
    didInitialize.current = true;
    setSharedDocument(initialFile);
  }, [isMember, setSharedDocument, sharedDocument]);

  const sketchFile =
    state.type === 'success' ? state.value.history.present.sketch : undefined;

  useEffect(() => {
    if (!didInitialize.current) return;
    if (!sketchFile) return;

    // Update shared doc for everyone
    setSharedDocument(sketchFile);
  }, [channels, join, setSharedDocument, sketchFile]);

  useEffect(() => {
    if (!sketchFile) return;

    // Join each page's channel
    sketchFile.pages.forEach((page) => join(page.do_objectID));
  }, [channels, join, setSharedDocument, sketchFile]);

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
      documentPath:
        'documentPath' in urlHashParameters
          ? castHashParameter(urlHashParameters.documentPath, 'string')
          : undefined,
      isElectron: castHashParameter(urlHashParameters.isElectron, 'boolean'),
      platform:
        'platform' in urlHashParameters
          ? (castHashParameter(
              urlHashParameters.platform,
              'string',
            ) as PlatformName)
          : getCurrentPlatform(navigator),
      hostName:
        'hostName' in urlHashParameters
          ? castHashParameter(urlHashParameters.hostName, 'string')
          : undefined,
      hostVersion:
        'hostVersion' in urlHashParameters
          ? castHashParameter(urlHashParameters.hostVersion, 'string')
          : undefined,
    }),
    [urlHashParameters],
  );

  return (
    <MultiplayerProvider userName="Devin">
      <EnvironmentParametersProvider value={environmentParameters}>
        <CanvasKitProvider>
          <FontManagerProvider>
            <Contents />
          </FontManagerProvider>
        </CanvasKitProvider>
      </EnvironmentParametersProvider>
    </MultiplayerProvider>
  );
}
