import { StateProvider } from 'noya-app-state-context';
import { setPublicPath } from 'noya-public-path';
import {
  CanvasKitProvider,
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
import React, { Suspense, useCallback, useEffect, useReducer } from 'react';
import { Content } from '../ayon/Content';
import { noyaAPI, NoyaAPI } from '../utils/api';

let initialized = false;

function Workspace({
  initialData,
  updateData,
}: {
  initialData: SketchFile;
  updateData: (design: SketchFile) => void;
}): JSX.Element {
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

  useEffect(() => {
    updateData(state.history.present.sketch);
  }, [state.history.present.sketch, updateData]);

  return (
    <StateProvider state={state} dispatch={dispatch}>
      <Content />
    </StateProvider>
  );
}

export default function Ayon({ file }: { file: NoyaAPI.File }): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  const updateData = (design: SketchFile) => {
    noyaAPI.files.update(file.id, {
      name: file.data.name,
      design,
    });
  };

  return (
    <Suspense fallback="Loading">
      <ImageCacheProvider>
        <CanvasKitProvider>
          <FontManagerProvider>
            <Workspace initialData={file.data.design} updateData={updateData} />
          </FontManagerProvider>
        </CanvasKitProvider>
      </ImageCacheProvider>
    </Suspense>
  );
}
