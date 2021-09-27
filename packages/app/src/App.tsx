import Sketch from 'noya-file-format';
import { StateProvider } from 'noya-app-state-context';
import { fileManager } from 'noya-embedded';
import { decodeFontName } from 'noya-fonts';
import { getCurrentPlatform, PlatformName } from 'noya-keymap';
import { PromiseState } from 'noya-react-utils';
import {
  CanvasKitProvider,
  drawBase64PNG,
  FontManagerProvider,
  ImageCacheProvider,
  useCanvasKit,
  useDownloadFont,
  useFontManager,
} from 'noya-renderer';
import { decode } from 'noya-sketch-file';
import { SketchModel } from 'noya-sketch-model';
import {
  createInitialWorkspaceState,
  createSketchFile,
  Selectors,
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import Workspace from './containers/Workspace';
import {
  EnvironmentParameters,
  EnvironmentParametersProvider,
  useEnvironmentParameter,
} from './hooks/useEnvironmentParameters';
import {
  castHashParameter,
  useUrlHashParameters,
} from './hooks/useUrlHashParameters';
import { CanvasKit } from 'canvaskit';

type Action =
  | { type: 'set'; value: WorkspaceState }
  | { type: 'update'; value: WorkspaceAction };

function Contents() {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const documentPath = useEnvironmentParameter('documentPath');

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
              value: action.value,
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
    if (state.type === 'success') return;

    async function loadFile() {
      const file = await fileManager.open({ path: documentPath });
      const data = await file.arrayBuffer();
      const sketch = await decode(data);

      dispatch({ type: 'set', value: createInitialWorkspaceState(sketch) });
      dispatch({ type: 'update', value: ['setFileHandle', file.handle] });
    }

    if (documentPath) {
      loadFile();
    } else {
      dispatch({ type: 'set', value: createPixelEditorState(CanvasKit) });
      // dispatch({ type: 'set', value: createSketchFile() });
    }
  }, [CanvasKit, documentPath, state.type]);

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
    <EnvironmentParametersProvider value={environmentParameters}>
      <CanvasKitProvider>
        <FontManagerProvider>
          <Contents />
        </FontManagerProvider>
      </CanvasKitProvider>
    </EnvironmentParametersProvider>
  );
}

function createPixelEditorState(CanvasKit: CanvasKit) {
  const createDefaultImage = (): Sketch.DataRef => {
    return {
      _class: 'MSJSONOriginalDataReference',
      _ref: '',
      _ref_class: 'MSImageData',
      data: {
        _data:
          drawBase64PNG(CanvasKit, { width: 24, height: 24 }, (canvas) => {
            canvas.clear(CanvasKit.TRANSPARENT);
          }) ?? '',
      },
      sha1: {
        _data: '',
      },
    };
  };

  const artboard = SketchModel.artboard({
    frame: SketchModel.rect({
      x: 0,
      y: 0,
      width: 24,
      height: 24,
    }),
    layers: [
      SketchModel.bitmap({
        name: 'Background',
        style: SketchModel.style({
          colorControls: SketchModel.colorControls({
            isEnabled: false,
          }),
        }),
        frame: SketchModel.rect({
          x: 0,
          y: 0,
          width: 24,
          height: 24,
        }),
        image: createDefaultImage(),
      }),
      SketchModel.bitmap({
        name: 'Foreground',
        style: SketchModel.style({
          colorControls: SketchModel.colorControls({
            isEnabled: false,
          }),
        }),
        frame: SketchModel.rect({
          x: 0,
          y: 0,
          width: 24,
          height: 24,
        }),
        image: createDefaultImage(),
      }),
    ],
  });

  const workspaceState = createInitialWorkspaceState(
    createSketchFile(SketchModel.page({ layers: [artboard] })),
  );
  workspaceState.isolatedLayer = artboard.do_objectID;
  workspaceState.preferences.showPixelGrid = true;

  return workspaceState;
}
