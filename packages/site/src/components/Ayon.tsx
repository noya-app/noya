import produce from 'immer';
import { NoyaAPI, useNoyaClient } from 'noya-api';
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
import { SketchModel } from 'noya-sketch-model';
import {
  createInitialWorkspaceState,
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import React, { Suspense, useCallback, useEffect, useReducer } from 'react';
import { Content } from '../ayon/Content';
import { allAyonSymbols, ayonLibraryId } from '../ayon/symbols';

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

    workspace.history.present.sketch.document.foreignSymbols =
      allAyonSymbols.map((symbol) =>
        SketchModel.foreignSymbol({
          symbolMaster: symbol,
          libraryID: ayonLibraryId,
        }),
      );

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

  const client = useNoyaClient();

  const updateData = (design: SketchFile) => {
    const designWithoutForeignSymbols = produce(design, (draft) => {
      draft.document.foreignSymbols = [];
    });

    client.files.update(file.id, {
      name: file.data.name,
      design: designWithoutForeignSymbols,
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
