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
  Layers,
  WorkspaceAction,
  workspaceReducer,
  WorkspaceState,
} from 'noya-state';
import React, {
  ComponentProps,
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
  uploadAsset,
  initialDocument,
  onChangeDocument,
}: {
  uploadAsset: ComponentProps<typeof Content>['uploadAsset'];
  initialDocument: SketchFile;
  onChangeDocument: (document: SketchFile) => void;
}): JSX.Element {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();

  const reducer = useCallback(
    (state: WorkspaceState, action: WorkspaceAction) =>
      workspaceReducer(state, action, CanvasKit, fontManager),
    [CanvasKit, fontManager],
  );

  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const workspace = createInitialWorkspaceState(initialDocument);

    return produce(workspace, (draft) => {
      draft.preferences.showDotGrid = true;
      draft.preferences.wireframeMode = true;

      const artboardId = Layers.find(
        draft.history.present.sketch.pages[0],
        Layers.isArtboard,
      )?.do_objectID;

      draft.history.present.isolatedLayerId = artboardId;

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
    const documentWithoutForeignSymbols = produce(
      state.history.present.sketch,
      (draft) => {
        draft.document.foreignSymbols = [];
      },
    );

    onChangeDocument(documentWithoutForeignSymbols);
  }, [state.history.present.sketch, onChangeDocument]);

  return (
    <StateProvider state={state} dispatch={dispatch}>
      <Content uploadAsset={uploadAsset} />
    </StateProvider>
  );
}

export default memo(function Ayon(
  props: ComponentProps<typeof Workspace>,
): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  return (
    <Suspense fallback={null}>
      <ImageCacheProvider>
        <CanvasKitProvider>
          <FontManagerProvider>
            <Workspace {...props} />
          </FontManagerProvider>
        </CanvasKitProvider>
      </ImageCacheProvider>
    </Suspense>
  );
});
