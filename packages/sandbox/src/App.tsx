import produce from 'immer';
import { StateProvider } from 'noya-app-state-context';
import {
  darkTheme,
  DesignSystemConfigurationProvider,
} from 'noya-designsystem';
import { setPublicPath } from 'noya-public-path';
import {
  CanvasKitProvider,
  FontManagerProvider,
  ImageCacheProvider,
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
import * as React from 'react';
import { Suspense, useReducer } from 'react';
import { Content } from './Content';

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
    <StateProvider state={state} dispatch={dispatch}>
      <ImageCacheProvider>
        <Content />
      </ImageCacheProvider>
    </StateProvider>
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
        <CanvasKitProvider>
          <FontManagerProvider>
            <Workspace />
          </FontManagerProvider>
        </CanvasKitProvider>
      </Suspense>
    </DesignSystemConfigurationProvider>
  );
}
