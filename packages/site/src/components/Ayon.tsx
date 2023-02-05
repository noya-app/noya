import * as ChakraUI from '@chakra-ui/react';
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
import { toZipFile } from 'noya-filesystem';
import { Size } from 'noya-geometry';
import {
  BoxIcon,
  ChevronDownIcon,
  CodeIcon,
  FigmaLogoIcon,
  FileIcon,
  ImageIcon,
  SketchLogoIcon,
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
import { UTF16 } from 'noya-utils';
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
import { Blocks } from '../ayon/blocks';
import { allAyonSymbols, ayonLibraryId } from '../ayon/blocks/symbols';
import { Content, ViewType } from '../ayon/Content';
import { useProject } from '../contexts/ProjectContext';
import { downloadBlob } from '../utils/download';
import { ProjectMenu } from './ProjectMenu';
import { ProjectTitle } from './ProjectTitle';

const Components = new Map<unknown, string>();

Object.entries(ChakraUI).forEach(([key, value]) => {
  Components.set(value, key);
});

export type ExportType = NoyaAPI.ExportFormat | 'figma' | 'sketch' | 'react';

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
  downloadFile?: (type: NoyaAPI.ExportFormat, size: Size, name: string) => void;
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
              value: 'figma',
              title: 'Figma',
              icon: <FigmaLogoIcon />,
            },
            {
              value: 'sketch',
              title: 'Sketch',
              icon: <SketchLogoIcon />,
            },
            SEPARATOR_ITEM,
            {
              value: 'react',
              title: 'React Code',
              icon: <CodeIcon />,
            },
          ]}
          onSelect={async (value) => {
            if (!artboard) return;

            switch (value) {
              case 'png':
              case 'pdf':
              case 'svg':
                downloadFile?.(value, artboard.frame, `Design.${value}`);
                return;
              case 'figma':
                downloadFile?.('svg', artboard.frame, `Drag into Figma.svg`);
                return;
              case 'sketch':
                downloadFile?.('pdf', artboard.frame, `Drag into Sketch.pdf`);
                return;
              case 'react': {
                const { compile } = await import('noya-compiler');
                const result = compile({
                  state: state.history.present,
                  Blocks,
                  Components,
                });
                const zipFile = await toZipFile(
                  {
                    'App.tsx': UTF16.toUTF8(result['App.tsx']),
                    'package.json': UTF16.toUTF8(result['package.json']),
                  },
                  'App.zip',
                );
                downloadBlob(zipFile);
                return;
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
        <CanvasKitProvider
          library={
            props.canvasRendererType === 'canvas' ? 'canvaskit' : 'svgkit'
          }
        >
          <FontManagerProvider>
            <Workspace {...props} />
          </FontManagerProvider>
        </CanvasKitProvider>
      </ImageCacheProvider>
    </Suspense>
  );
});
