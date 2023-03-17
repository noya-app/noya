import * as ChakraUI from '@chakra-ui/react';
import { VStack } from '@chakra-ui/react';
import produce from 'immer';
import { NoyaAPI } from 'noya-api';
import { StateProvider } from 'noya-app-state-context';
import {
  Button,
  Chip,
  DropdownMenu,
  Popover,
  RadioGroup,
  SEPARATOR_ITEM,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { toZipFile } from 'noya-filesystem';
import { Size } from 'noya-geometry';
import {
  BoxIcon,
  ChevronDownIcon,
  CodeIcon,
  CodeSandboxLogoIcon,
  CursorArrowIcon,
  FigmaLogoIcon,
  FileIcon,
  GroupIcon,
  ImageIcon,
  OpenInNewWindowIcon,
  PlusIcon,
  SketchLogoIcon,
  StarFilledIcon,
  TransformIcon,
  ViewVerticalIcon,
} from 'noya-icons';
import { getCurrentPlatform } from 'noya-keymap';
import { amplitude } from 'noya-log';
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
import InsertBlockWebp from '../assets/InsertBlock.webp';
import { allInsertableSymbols, Blocks } from '../ayon/blocks/blocks';
import { ayonLibraryId, boxSymbolId } from '../ayon/blocks/symbolIds';
import { Content, ViewType } from '../ayon/Content';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useProject } from '../contexts/ProjectContext';
import { ClientStorage } from '../utils/clientStorage';
import { downloadBlob } from '../utils/download';
import { NOYA_HOST } from '../utils/noyaClient';
import { OnboardingAnimation } from './OnboardingAnimation';
import { ProjectMenu } from './ProjectMenu';
import { ProjectTitle } from './ProjectTitle';
import { ShareMenu } from './ShareMenu';

const Components = new Map<unknown, string>();

Object.entries(ChakraUI).forEach(([key, value]) => {
  Components.set(value, key);
});

export type ExportType =
  | NoyaAPI.ExportFormat
  | 'figma'
  | 'sketch'
  | 'react'
  | 'codesandbox';

const persistedViewType =
  (ClientStorage.getItem('preferredViewType') as ViewType) || 'split';

function Workspace({
  fileId,
  uploadAsset,
  initialDocument,
  onChangeDocument,
  name,
  onChangeName,
  onDuplicate,
  viewType: initialViewType = persistedViewType,
  padding,
  canvasRendererType,
  downloadFile,
  isPlayground,
}: {
  fileId: string;
  initialDocument: SketchFile;
  onChangeDocument?: (document: SketchFile) => void;
  onDuplicate?: () => void;
  name: string;
  onChangeName?: (name: string) => void;
  viewType?: ViewType;
  downloadFile?: (type: NoyaAPI.ExportFormat, size: Size, name: string) => void;
} & Pick<
  ComponentProps<typeof Content>,
  'uploadAsset' | 'padding' | 'canvasRendererType' | 'isPlayground'
>): JSX.Element {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const [viewType, setViewTypeMemory] = useState<ViewType>(initialViewType);
  const { setRightToolbar, setCenterToolbar, setLeftToolbar } = useProject();
  const { onboardingStep, setOnboardingStep } = useOnboarding();
  const theme = useDesignSystemTheme();

  const setViewType = useCallback(
    (type: ViewType) => {
      switch (type) {
        case 'split':
          amplitude.logEvent('Project - View - Switched to Split View');
          break;
        case 'combined':
          amplitude.logEvent('Project - View - Switched to Combined View');
          break;
      }

      ClientStorage.setItem('preferredViewType', type);

      setViewTypeMemory(type);
    },
    [setViewTypeMemory],
  );

  const reducer = useCallback(
    (state: WorkspaceState, action: WorkspaceAction) => {
      if (window.noyaPageWillReload) return state;

      return workspaceReducer(state, action, CanvasKit, fontManager);
    },
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

      draft.history.present.sketch.document.foreignSymbols =
        allInsertableSymbols.map((symbol) =>
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

  const artboard = Layers.find<Sketch.Artboard>(
    Selectors.getCurrentPage(state.history.present),
    Layers.isArtboard,
  );

  const showInsertBlockOnboarding = onboardingStep === 'started';

  const interactionState = state.history.present.interactionState;
  const cursorType =
    interactionState.type === 'insert' ||
    interactionState.type === 'drawing' ||
    (interactionState.type === 'editingBlock' &&
      interactionState.cursor === 'crosshair')
      ? 'insert'
      : interactionState.type === 'selectionMode' ||
        interactionState.type === 'marquee' ||
        (interactionState.type === 'maybeMarquee' &&
          interactionState.method === 'mouse') ||
        (interactionState.type === 'editingBlock' &&
          interactionState.cursor === 'cell')
      ? 'region'
      : // Don't show the pointer button active during onboarding, since it's distracting
      showInsertBlockOnboarding
      ? ''
      : 'pointer';

  useEffect(() => {
    setLeftToolbar(
      <Stack.H alignSelf={'center'} width={99}>
        <RadioGroup.Root
          value={cursorType}
          variant="secondary"
          allowEmpty
          onValueChange={(value: typeof cursorType) => {
            if (!value || value === 'pointer') {
              dispatch(['interaction', ['reset']]);
              return;
            }

            switch (value) {
              case 'region': {
                dispatch(['interaction', ['enableSelectionMode', 'mouse']]);
                break;
              }
              case 'insert': {
                setOnboardingStep?.('insertedBlock');
                dispatch([
                  'interaction',
                  ['insert', { symbolId: boxSymbolId }, 'mouse'],
                ]);
                break;
              }
            }
          }}
        >
          <RadioGroup.Item
            value="pointer"
            tooltip={
              <VStack alignItems="start">
                <Small fontWeight={600}>Pointer Tool</Small>
                <Small>Click to select and drag blocks.</Small>
              </VStack>
            }
          >
            <CursorArrowIcon />
          </RadioGroup.Item>
          <Popover
            sideOffset={0}
            open={showInsertBlockOnboarding}
            onClickClose={() => {
              setOnboardingStep?.('insertedBlock');
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
            }}
            closable
            trigger={
              <RadioGroup.Item
                value="insert"
                tooltip={
                  !showInsertBlockOnboarding && (
                    <VStack alignItems="start">
                      <Small fontWeight={600}>Insert Tool</Small>
                      <Small>Click and drag to draw a block.</Small>
                      <Small>
                        Hold{' '}
                        <Chip variant="secondary">
                          {getCurrentPlatform(navigator) === 'mac'
                            ? 'Cmd ⌘'
                            : 'Ctrl'}
                        </Chip>{' '}
                        to activate.
                      </Small>
                    </VStack>
                  )
                }
              >
                <PlusIcon />
              </RadioGroup.Item>
            }
          >
            <Stack.V width={300} padding={20} gap={10}>
              <Small fontWeight={'bold'}>Step 1: Insert a block</Small>
              <Small>
                Use the insert tool{' '}
                <PlusIcon
                  style={{
                    display: 'inline-block',
                    verticalAlign: 'text-bottom',
                    scale: 0.85,
                  }}
                />{' '}
                to draw a block on the left canvas.
              </Small>
              <Small>
                You can activate this tool at any time by holding{' '}
                <Chip variant="secondary">
                  {getCurrentPlatform(navigator) === 'mac' ? 'Cmd ⌘' : 'Ctrl'}
                </Chip>
              </Small>
              <OnboardingAnimation src={InsertBlockWebp.src} />
            </Stack.V>
          </Popover>
          <RadioGroup.Item
            value="region"
            tooltip={
              <VStack alignItems="start">
                <Small fontWeight={600}>Region Tool</Small>
                <Small>Click and drag to draw a region.</Small>
                <Small>
                  Hold <Chip variant="secondary">Shift</Chip> to activate.
                </Small>
              </VStack>
            }
          >
            <GroupIcon />
          </RadioGroup.Item>
        </RadioGroup.Root>
      </Stack.H>,
    );
  }, [
    cursorType,
    setLeftToolbar,
    setOnboardingStep,
    showInsertBlockOnboarding,
    theme.colors.divider,
    theme.colors.dividerStrong,
  ]);

  const designSystem =
    state.history.present.sketch.document.designSystemID ?? 'mui';

  useLayoutEffect(() => {
    setRightToolbar(
      <Stack.H gap={8}>
        <DropdownMenu<ViewType | 'livePreview'>
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
            SEPARATOR_ITEM,
            {
              value: 'livePreview',
              title: 'Live Preview',
              icon: <OpenInNewWindowIcon />,
            },
          ]}
          onSelect={(value) => {
            switch (value) {
              case 'combined':
              case 'split': {
                setViewType(value);
                break;
              }
              case 'livePreview': {
                window.open(`${NOYA_HOST}/app/projects/${fileId}/preview`);
                break;
              }
            }
          }}
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
              title: (
                <>
                  React Code
                  <Spacer.Horizontal inline size={6} />
                  <StarFilledIcon color="#fec422" />
                </>
              ),
              icon: <CodeIcon />,
            },
            {
              value: 'codesandbox',
              title: (
                <>
                  CodeSandbox
                  <Spacer.Horizontal inline size={6} />
                  <StarFilledIcon color="#fec422" />
                </>
              ),
              icon: <CodeSandboxLogoIcon />,
            },
          ]}
          onSelect={async (value) => {
            if (!artboard) return;

            switch (value) {
              case 'png':
              case 'pdf':
              case 'svg':
                switch (value) {
                  case 'png':
                    amplitude.logEvent('Project - Export - Exported PNG');
                    break;
                  case 'pdf':
                    amplitude.logEvent('Project - Export - Exported PDF');
                    break;
                  case 'svg':
                    amplitude.logEvent('Project - Export - Exported SVG');
                    break;
                }

                downloadFile?.(value, artboard.frame, `Design.${value}`);
                return;
              case 'figma':
                amplitude.logEvent('Project - Export - Exported Figma');
                downloadFile?.('svg', artboard.frame, `Drag into Figma.svg`);
                return;
              case 'sketch':
                amplitude.logEvent('Project - Export - Exported Sketch');
                downloadFile?.('pdf', artboard.frame, `Drag into Sketch.pdf`);
                return;
              case 'react': {
                amplitude.logEvent('Project - Export - Exported React Code');
                const { compile } = await import('noya-compiler');
                const result = await compile({
                  artboard,
                  Blocks,
                  DesignSystem: designSystem,
                  target: 'standalone',
                });
                const zipFile = await toZipFile(
                  Object.fromEntries(
                    Object.entries(result).map(
                      ([name, content]) =>
                        [name, UTF16.toUTF8(content)] as const,
                    ),
                  ),
                  'App.zip',
                );
                downloadBlob(zipFile);
                return;
              }
              case 'codesandbox': {
                const { compile, openInCodesandbox } = await import(
                  'noya-compiler'
                );
                const result = await compile({
                  artboard,
                  Blocks,
                  DesignSystem: designSystem,
                  target: 'codesandbox',
                });
                openInCodesandbox({ files: result });
                // amplitude.logEvent('Project - Export - Exported CodeSandbox');
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
        <Popover
          trigger={
            <Button>
              Share
              <Spacer.Horizontal size={4} />
              <ChevronDownIcon />
            </Button>
          }
          onOpenChange={() => {
            dispatch(['selectLayer', []]);
          }}
        >
          <Stack.V width={240}>
            <ShareMenu fileId={fileId} />
          </Stack.V>
        </Popover>
      </Stack.H>,
    );
  }, [
    downloadFile,
    setRightToolbar,
    state.history.present,
    viewType,
    artboard,
    setViewType,
    name,
    onChangeName,
    fileId,
    designSystem,
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
              designSystem={designSystem}
              onChangeDesignSystem={(value) => {
                dispatch(['setDesignSystemId', value]);
              }}
              onChangeName={onChangeName || (() => {})}
              onDuplicate={onDuplicate || (() => {})}
            />
          </Stack.V>
        </Popover>
      </StateProvider>,
    );
  }, [designSystem, name, onChangeName, onDuplicate, setCenterToolbar, state]);

  return (
    <StateProvider state={state} dispatch={dispatch}>
      <Content
        canvasRendererType={canvasRendererType}
        uploadAsset={uploadAsset}
        viewType={viewType}
        padding={padding}
        isPlayground={isPlayground}
        designSystem={designSystem}
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
