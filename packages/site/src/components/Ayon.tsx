import produce from 'immer';
import { StateProvider } from 'noya-app-state-context';
import { Button, DropdownMenu, Spacer } from 'noya-designsystem';
import { BoxIcon, ChevronDownIcon, ViewVerticalIcon } from 'noya-icons';
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
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useState,
} from 'react';
import { Content, ViewType } from '../ayon/Content';
import { allAyonSymbols, ayonLibraryId } from '../ayon/symbols';

function Workspace({
  uploadAsset,
  initialDocument,
  onChangeDocument,
  setRightToolbar,
}: {
  uploadAsset: ComponentProps<typeof Content>['uploadAsset'];
  initialDocument: SketchFile;
  onChangeDocument: (document: SketchFile) => void;
  setRightToolbar: (element: ReactNode) => void;
}): JSX.Element {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const [viewType, setViewType] = useState<ViewType>('split');

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

  useLayoutEffect(() => {
    setRightToolbar(
      <DropdownMenu<ViewType>
        items={[
          {
            value: 'split',
            title: 'Split View',
            icon: <ViewVerticalIcon />,
            checked: viewType === 'split',
          },
          {
            value: 'combined',
            title: 'Combined View',
            icon: <BoxIcon />,
            checked: viewType === 'combined',
          },
        ]}
        onSelect={setViewType}
      >
        <Button>
          View
          <Spacer.Horizontal size={4} />
          <ChevronDownIcon />
        </Button>
      </DropdownMenu>,
    );
  }, [setRightToolbar, viewType]);

  return (
    <StateProvider state={state} dispatch={dispatch}>
      <Content uploadAsset={uploadAsset} viewType={viewType} />
    </StateProvider>
  );
}

let initialized = false;

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
