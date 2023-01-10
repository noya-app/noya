import { StateProvider } from 'noya-app-state-context';
import {
  DesignSystemConfigurationProvider,
  lightTheme,
} from 'noya-designsystem';
import { getCurrentPlatform } from 'noya-keymap';
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
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import * as React from 'react';
import { Suspense, useReducer } from 'react';
import { Content } from './Content';
import {
  avatarSymbol,
  boxSymbol,
  buttonSymbol,
  checkboxSymbol,
  headingSymbol,
  iconButtonSymbol,
  imageSymbol,
  inputSymbol,
  switchSymbol,
  textSymbol,
} from './symbols';

let initialized = false;

const rectangle = SketchModel.rectangle({
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
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
    (state: WorkspaceState, action: WorkspaceAction) =>
      workspaceReducer(state, action, CanvasKit, fontManager),
    [CanvasKit, fontManager],
  );

  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const workspace = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [artboard] })),
    );
    workspace.preferences.showDotGrid = true;
    workspace.preferences.wireframeMode = true;
    workspace.history.present.sketch.pages.push(
      SketchModel.page({
        name: 'Symbols',
        layers: [
          buttonSymbol,
          avatarSymbol,
          boxSymbol,
          boxSymbol,
          checkboxSymbol,
          iconButtonSymbol,
          inputSymbol,
          switchSymbol,
          textSymbol,
          imageSymbol,
          headingSymbol,
        ],
      }),
    );

    return workspace;
  });

  return (
    <StateProvider state={state} dispatch={dispatch}>
      <Content />
    </StateProvider>
  );
}

export default function App(): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  return (
    <DesignSystemConfigurationProvider
      theme={lightTheme}
      platform={getCurrentPlatform(navigator)}
    >
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
