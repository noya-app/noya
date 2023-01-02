import produce from 'immer';
import { StateProvider } from 'noya-app-state-context';
import { Canvas, Interactions, SimpleCanvas } from 'noya-canvas';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { setPublicPath } from 'noya-public-path';
import {
  CanvasKitProvider,
  FontManagerProvider,
  ImageCacheProvider,
  RenderingModeProvider,
  SketchFileRenderer,
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
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    ),
  );

  return (
    <div style={{ flex: '1', display: 'flex' }}>
      <div style={{ flex: '1', display: 'flex' }}>
        <StateProvider state={state} dispatch={dispatch}>
          <SimpleCanvas
            interactions={[
              Interactions.selection,
              Interactions.move,
              Interactions.marquee,
            ]}
          >
            {({ size }) => (
              <SVGRenderer size={size}>
                <RenderingModeProvider value="interactive">
                  <SketchFileRenderer />
                </RenderingModeProvider>
              </SVGRenderer>
            )}
          </SimpleCanvas>
        </StateProvider>
      </div>
      <div style={{ flex: '1', display: 'flex' }}>
        <StateProvider state={state}>
          <Canvas>
            {({ size }) => (
              <SVGRenderer size={size}>
                <RenderingModeProvider value="static">
                  <SketchFileRenderer />
                </RenderingModeProvider>
              </SVGRenderer>
            )}
          </Canvas>
        </StateProvider>
      </div>
    </div>
  );
}

const theme = produce(darkTheme, (draft) => {
  draft.sizes.sidebarWidth = 0;
  draft.sizes.toolbar.height = 0;
});

export default function Embedded(): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  return (
    <DesignSystemConfigurationProvider theme={theme} platform={'key'}>
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
