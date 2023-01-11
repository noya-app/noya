import { StateProvider } from 'noya-app-state-context';
import { CanvasKitRenderer, Interactions, SimpleCanvas } from 'noya-canvas';
import { setPublicPath } from 'noya-public-path';
import {
  CanvasKitProvider,
  DesignFile,
  FontManagerProvider,
  ImageCacheProvider,
  useCanvasKit,
  useFontManager,
} from 'noya-renderer';
import { SketchFile } from 'noya-sketch-file';
import {
  createInitialWorkspaceState,
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import React, { Suspense, useCallback, useReducer } from 'react';
import { NoyaAPI } from '../utils/api';

let initialized = false;

function Workspace({ initialData }: { initialData: SketchFile }): JSX.Element {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();

  const reducer = useCallback(
    (state: WorkspaceState, action: WorkspaceAction) =>
      workspaceReducer(state, action, CanvasKit, fontManager),
    [CanvasKit, fontManager],
  );

  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const workspace = createInitialWorkspaceState(initialData);
    workspace.preferences.showDotGrid = true;
    workspace.preferences.wireframeMode = true;

    return workspace;
  });

  return (
    <StateProvider state={state} dispatch={dispatch}>
      <SimpleCanvas interactions={[Interactions.pan]}>
        {({ size }) => (
          <CanvasKitRenderer size={size}>
            <DesignFile />
          </CanvasKitRenderer>
        )}
      </SimpleCanvas>
    </StateProvider>
  );
}

export default function Ayon({ file }: { file: NoyaAPI.File }): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  return (
    <Suspense fallback="Loading">
      <ImageCacheProvider>
        <CanvasKitProvider>
          <FontManagerProvider>
            <Workspace initialData={file.data.design} />
          </FontManagerProvider>
        </CanvasKitProvider>
      </ImageCacheProvider>
    </Suspense>
  );
}
