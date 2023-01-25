import produce from 'immer';
import { StateProvider } from 'noya-app-state-context';
import {
  Button,
  DropdownMenu,
  Popover,
  Spacer,
  Stack,
} from 'noya-designsystem';
import {
  BoxIcon,
  ChevronDownIcon,
  CodeIcon,
  ImageIcon,
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
import { generateCode } from '../ayon/generateCode';
import { useProject } from '../contexts/ProjectContext';
import { ProjectMenu } from './ProjectMenu';
import { ProjectTitle } from './ProjectTitle';

export type ExportType = 'png' | 'react';

function Workspace({
  uploadAsset,
  initialDocument,
  onChangeDocument,
  name,
  onChangeName,
  viewType: initialViewType = 'split',
  padding,
  canvasRendererType,
}: {
  initialDocument: SketchFile;
  onChangeDocument?: (document: SketchFile) => void;
  name: string;
  onChangeName?: (name: string) => void;
  viewType?: ViewType;
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

  useLayoutEffect(() => {
    setRightToolbar(
      <Stack.H gap={8}>
        <DropdownMenu<ExportType>
          items={[
            {
              value: 'png',
              title: 'Image',
              icon: <ImageIcon />,
            },
            {
              value: 'react',
              title: 'React Code',
              icon: <CodeIcon />,
            },
          ]}
          onSelect={() => {
            const result = generateCode(state.history.present);
            console.info('export', result);
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
  }, [setRightToolbar, state.history.present, viewType]);

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
