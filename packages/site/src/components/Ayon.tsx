import produce from 'immer';
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
import React, {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
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

    return produce(workspace, (draft) => {
      draft.preferences.showDotGrid = true;
      draft.preferences.wireframeMode = true;

      draft.history.present.sketch.document.foreignSymbols = allAyonSymbols.map(
        (symbol) =>
          SketchModel.foreignSymbol({
            symbolMaster: symbol,
            libraryID: ayonLibraryId,
          }),
      );

      return draft;
    });
  });

  useEffect(() => {
    const designWithoutForeignSymbols = produce(
      state.history.present.sketch,
      (draft) => {
        draft.document.foreignSymbols = [];
      },
    );

    updateData(designWithoutForeignSymbols);
  }, [state.history.present.sketch, updateData]);

  return (
    <StateProvider state={state} dispatch={dispatch}>
      <Content />
    </StateProvider>
  );
}

export default memo(function Ayon({
  initialDesign,
  onChange,
}: {
  initialDesign: SketchFile;
  onChange: (design: SketchFile) => void;
}): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  return (
    <Suspense fallback={null}>
      <ImageCacheProvider>
        <CanvasKitProvider>
          <FontManagerProvider>
            <Workspace initialData={initialDesign} updateData={onChange} />
          </FontManagerProvider>
        </CanvasKitProvider>
      </ImageCacheProvider>
    </Suspense>
  );
});
