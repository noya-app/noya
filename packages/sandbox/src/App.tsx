import { StateProvider } from 'noya-app-state-context';
import { CanvasKitRenderer, Interactions, SimpleCanvas } from 'noya-canvas';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
} from 'noya-designsystem';
import { setPublicPath } from 'noya-public-path';
import {
  CanvasKitProvider,
  DesignFile,
  FontManagerProvider,
  ImageCacheProvider,
  RenderingModeProvider,
  useCanvasKit,
  useFontManager,
} from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import {
  createInitialWorkspaceState,
  createSketchFile,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import { SVGRenderer } from 'noya-svg-renderer';
import * as React from 'react';
import { Suspense, useReducer } from 'react';

let initialized = false;

const rectangle = SketchModel.rectangle({
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }),
  style: SketchModel.style({
    fills: [
      SketchModel.fill({
        color: SketchModel.color({ red: 1, alpha: 1 }),
      }),
    ],
  }),
});

const artboard = SketchModel.artboard({
  name: 'Wireframe',
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 400,
    height: 800,
  }),
  layers: [rectangle],
});

function Workspace(): JSX.Element {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();

  const reducer = React.useCallback(
    (state: WorkspaceState, action: any) =>
      workspaceReducer(state, action, CanvasKit, fontManager),
    [CanvasKit, fontManager],
  );

  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [artboard] })),
    ),
  );

  return (
    <div style={{ flex: '1', display: 'flex' }}>
      <div style={{ flex: '1', display: 'flex' }}>
        <StateProvider state={state} dispatch={dispatch}>
          <SimpleCanvas
            interactions={[
              Interactions.focus,
              Interactions.pan,
              Interactions.selection,
              Interactions.move,
              Interactions.createDrawing({ initialState: 'none' }),
              Interactions.marquee,
            ]}
          >
            {({ size }) => (
              <CanvasKitRenderer size={size}>
                <RenderingModeProvider value="interactive">
                  <DesignFile />
                </RenderingModeProvider>
              </CanvasKitRenderer>
            )}
          </SimpleCanvas>
        </StateProvider>
      </div>
      <div style={{ flex: '1', display: 'flex' }}>
        <StateProvider state={state}>
          <SimpleCanvas>
            {({ size }) => (
              <SVGRenderer size={size}>
                <RenderingModeProvider value="static">
                  <DesignFile />
                </RenderingModeProvider>
              </SVGRenderer>
            )}
          </SimpleCanvas>
        </StateProvider>
      </div>
    </div>
  );
}

export default function Embedded(): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  return (
    <DesignSystemConfigurationProvider theme={lightTheme} platform={'key'}>
      <Suspense fallback="Loading">
        <ImageCacheProvider>
          <CanvasKitProvider>
            <FontManagerProvider>
              <Workspace />
            </FontManagerProvider>
          </CanvasKitProvider>
        </ImageCacheProvider>
      </Suspense>
    </DesignSystemConfigurationProvider>
  );
}
