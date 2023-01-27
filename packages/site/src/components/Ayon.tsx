import produce from 'immer';
import { NoyaAPI } from 'noya-api';
import { StateProvider } from 'noya-app-state-context';
import {
  Button,
  DropdownMenu,
  Popover,
  SEPARATOR_ITEM,
  Spacer,
  Stack,
} from 'noya-designsystem';
import { Size } from 'noya-geometry';
import {
  BoxIcon,
  ChevronDownIcon,
  CodeIcon,
  FileIcon,
  ImageIcon,
  TransformIcon,
  ViewVerticalIcon,
} from 'noya-icons';
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
  Selectors,
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
  useLayoutEffect,
  useReducer,
  useState,
} from 'react';
import { allAyonSymbols, ayonLibraryId } from '../ayon/blocks/symbols';
import { Content, ViewType } from '../ayon/Content';
import { useProject } from '../contexts/ProjectContext';
import { ProjectMenu } from './ProjectMenu';
import { ProjectTitle } from './ProjectTitle';

export type ExportType = NoyaAPI.ExportFormat | 'react';

function Workspace({
  uploadAsset,
  initialDocument,
  onChangeDocument,
  name,
  onChangeName,
  viewType: initialViewType = 'split',
  padding,
  canvasRendererType,
  downloadFile,
}: {
  initialDocument: SketchFile;
  onChangeDocument?: (document: SketchFile) => void;
  name: string;
  onChangeName?: (name: string) => void;
  viewType?: ViewType;
  downloadFile?: (type: NoyaAPI.ExportFormat, size: Size) => void;
} & Pick<
  ComponentProps<typeof Content>,
  'uploadAsset' | 'padding' | 'canvasRendererType'
>): JSX.Element {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const [viewType, setViewType] = useState<ViewType>(initialViewType);
  const { setRightToolbar, setCenterToolbar } = useProject();

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

    onChangeDocument?.(documentWithoutForeignSymbols);
  }, [state.history.present.sketch, onChangeDocument]);

  const artboard = Layers.find(
    Selectors.getCurrentPage(state.history.present),
    Layers.isArtboard,
  );

  useLayoutEffect(() => {
    setRightToolbar(
      <Stack.H gap={8}>
        <DropdownMenu<ExportType>
          items={[
            {
              value: 'png',
              title: 'PNG',
              icon: <ImageIcon />,
            },
            {
              value: 'pdf',
              title: 'PDF',
              icon: <FileIcon />,
            },
            {
              value: 'svg',
              title: 'SVG',
              icon: <TransformIcon />,
            },
            SEPARATOR_ITEM,
            {
              value: 'react',
              title: 'React Code',
              icon: <CodeIcon />,
            },
          ]}
          onSelect={async (value) => {
            switch (value) {
              case 'png':
              case 'pdf':
              case 'svg':
                if (!artboard) return;
                downloadFile?.(value, artboard.frame);
                return;
              case 'react': {
                const { generateCode } = await import('../ayon/generateCode');
                const result = generateCode(state.history.present);
                console.info('export', result);
              }
            }
          }}
          onOpenChange={() => {
            dispatch(['selectLayer', []]);
          }}
        >
          <Button>
            Export
            <Spacer.Horizontal size={4} />
            <ChevronDownIcon />
          </Button>
        </DropdownMenu>
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
          onOpenChange={() => {
            dispatch(['selectLayer', []]);
          }}
        >
          <Button>
            View
            <Spacer.Horizontal size={4} />
            <ChevronDownIcon />
          </Button>
        </DropdownMenu>
      </Stack.H>,
    );
  }, [
    downloadFile,
    setRightToolbar,
    state.history.present,
    viewType,
    artboard,
  ]);

  useLayoutEffect(() => {
    setCenterToolbar(
      <StateProvider state={state} dispatch={dispatch}>
        <Popover
          trigger={<ProjectTitle>{name}</ProjectTitle>}
          onOpenChange={() => {
            dispatch(['selectLayer', []]);
          }}
        >
          <Stack.V width={240}>
            <ProjectMenu
              name={name}
              onChangeName={onChangeName || (() => {})}
            />
          </Stack.V>
        </Popover>
      </StateProvider>,
    );
  }, [name, onChangeName, setCenterToolbar, state]);

  return (
    <StateProvider state={state} dispatch={dispatch}>
      <Content
        canvasRendererType={canvasRendererType}
        uploadAsset={uploadAsset}
        viewType={viewType}
        padding={padding}
      />
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
