import produce from 'immer';
import { NoyaAPI } from 'noya-api';
import { StateProvider, useApplicationState } from 'noya-app-state-context';
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
  ChevronDownIcon,
  CodeIcon,
  CodeSandboxLogoIcon,
  CursorArrowIcon,
  FigmaLogoIcon,
  FileIcon,
  GroupIcon,
  ImageIcon,
  PlusIcon,
  SketchLogoIcon,
  StarFilledIcon,
  TransformIcon,
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
  Layers,
  Selectors,
  WorkspaceAction,
  WorkspaceState,
  createInitialWorkspaceState,
  workspaceReducer,
} from 'noya-state';
import { UTF16 } from 'noya-utils';
import React, {
  ComponentProps,
  Suspense,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
} from 'react';
import InsertBlockWebp from '../assets/InsertBlock.webp';
import { Content } from '../ayon/components/Content';
import { ayonReducer } from '../ayon/state/ayonReducer';
import { ayonLibraryId, boxSymbolId } from '../ayon/symbols/symbolIds';
import { librarySymbols } from '../ayon/symbols/symbols';
import { ViewType } from '../ayon/types';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useProject } from '../contexts/ProjectContext';
import { downloadBlob } from '../utils/download';
import { AyonProvider } from './AyonContext';
import { DSProvider, useDS } from './DSContext';
import { OnboardingAnimation } from './OnboardingAnimation';
import { ShareMenu } from './ShareMenu';

export type ExportType =
  | NoyaAPI.ExportFormat
  | 'figma'
  | 'sketch'
  | 'react'
  | 'codesandbox';

function Workspace({
  fileId,
  uploadAsset,
  name,
  onChangeName,
  onDuplicate,
  viewType = 'combined',
  padding,
  canvasRendererType,
  downloadFile,
  isPlayground,
}: {
  fileId: string;
  onDuplicate?: () => void;
  name: string;
  onChangeName?: (name: string) => void;
  viewType?: ViewType;
  downloadFile?: (type: NoyaAPI.ExportFormat, size: Size, name: string) => void;
} & Pick<
  ComponentProps<typeof Content>,
  'uploadAsset' | 'padding' | 'canvasRendererType' | 'isPlayground'
>): JSX.Element {
  const [state, dispatch] = useApplicationState();
  const { setRightToolbar, setLeftToolbar } = useProject();
  const { onboardingStep, setOnboardingStep } = useOnboarding();
  const theme = useDesignSystemTheme();

  const getSymbolMaster = useCallback(
    (id: string) => Selectors.getSymbolMaster(state, id),
    [state],
  );

  const artboard = Layers.find<Sketch.Artboard>(
    Selectors.getCurrentPage(state),
    Layers.isArtboard,
  );

  const showInsertBlockOnboarding = onboardingStep === 'started';

  const interactionState = state.interactionState;
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
    if (isPlayground) return;

    setLeftToolbar(
      <Stack.H alignSelf={'center'} width={99}>
        <RadioGroup.Root
          value={cursorType}
          variant="secondary"
          allowEmpty
          onValueChange={(value: typeof cursorType) => {
            if (!value || value === 'pointer') {
              dispatch('interaction', ['reset']);
              return;
            }

            switch (value) {
              case 'region': {
                dispatch('interaction', ['enableSelectionMode', 'mouse']);
                break;
              }
              case 'insert': {
                setOnboardingStep?.('insertedBlock');
                dispatch('interaction', [
                  'insert',
                  { symbolId: boxSymbolId },
                  'mouse',
                ]);
                break;
              }
            }
          }}
        >
          <RadioGroup.Item
            value="pointer"
            tooltip={
              <Stack.V alignItems="start">
                <Small fontWeight={600}>Pointer Tool</Small>
                <Small>Click to select and drag blocks.</Small>
              </Stack.V>
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
                    <Stack.V alignItems="start">
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
                    </Stack.V>
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
              <Stack.V alignItems="start">
                <Small fontWeight={600}>Region Tool</Small>
                <Small>Click and drag to draw a region.</Small>
                <Small>
                  Hold <Chip variant="secondary">Shift</Chip> to activate.
                </Small>
              </Stack.V>
            }
          >
            <GroupIcon />
          </RadioGroup.Item>
        </RadioGroup.Root>
      </Stack.H>,
    );
  }, [
    cursorType,
    dispatch,
    isPlayground,
    setLeftToolbar,
    setOnboardingStep,
    showInsertBlockOnboarding,
    theme.colors.divider,
    theme.colors.dividerStrong,
  ]);

  const ds = useDS();

  useLayoutEffect(() => {
    if (isPlayground) return;

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
                if (!ds) return;

                amplitude.logEvent('Project - Export - Exported React Code');
                const { compile } = await import('noya-compiler');
                const result = await compile({
                  name,
                  artboard,
                  getSymbolMaster,
                  DesignSystem: ds,
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
                if (!ds) return;

                const { compile, openInCodesandbox } = await import(
                  'noya-compiler'
                );
                const result = await compile({
                  name,
                  artboard,
                  getSymbolMaster,
                  DesignSystem: ds,
                  target: 'codesandbox',
                });
                openInCodesandbox({ files: result });
                // amplitude.logEvent('Project - Export - Exported CodeSandbox');
              }
            }
          }}
          onOpenChange={() => {
            dispatch('selectLayer', []);
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
            dispatch('selectLayer', []);
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
    state,
    artboard,
    name,
    fileId,
    isPlayground,
    getSymbolMaster,
    dispatch,
    ds,
  ]);

  if (!ds) {
    return (
      <div>
        <span
          style={{
            fontSize: '15px',
          }}
        >
          Could not find design system
        </span>
        <span>Change the design system in the project menu.</span>
      </div>
    );
  }

  return (
    <Content
      name={name}
      onChangeName={onChangeName}
      onDuplicate={onDuplicate}
      canvasRendererType={canvasRendererType}
      uploadAsset={uploadAsset}
      viewType={viewType}
      padding={padding}
      isPlayground={isPlayground}
      ds={ds}
    />
  );
}

let initialized = false;

const AyonControlledState = memo(function AyonWithState({
  initialDocument,
  onChangeDocument,
  children,
}: {
  initialDocument: SketchFile;
  onChangeDocument?: (document: SketchFile) => void;
  children: React.ReactNode;
}) {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();

  const reducer = useCallback(
    (state: WorkspaceState, action: WorkspaceAction) => {
      if (window.noyaPageWillReload) return state;

      return workspaceReducer(
        state,
        action,
        CanvasKit,
        fontManager,
        ayonReducer,
      );
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

      draft.history.present.sketch.document.foreignSymbols = librarySymbols.map(
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

  return (
    <StateProvider state={state} dispatch={dispatch}>
      <DSProvider
        savedDesignSystem={state.history.present.sketch.document.designSystem}
      >
        {children}
      </DSProvider>
    </StateProvider>
  );
});

export const Ayon = memo(function Ayon({
  initialDocument,
  onChangeDocument,
  ...props
}: ComponentProps<typeof Workspace> &
  Omit<ComponentProps<typeof AyonControlledState>, 'children'>): JSX.Element {
  if (!initialized) {
    setPublicPath('https://www.noya.design');
    initialized = true;
  }

  return (
    <AyonProvider value={Ayon}>
      <Suspense fallback={null}>
        <ImageCacheProvider>
          <CanvasKitProvider
            library={
              props.canvasRendererType === 'canvas' ? 'canvaskit' : 'svgkit'
            }
          >
            <FontManagerProvider>
              <AyonControlledState
                initialDocument={initialDocument}
                onChangeDocument={onChangeDocument}
              >
                <Workspace {...props} />
              </AyonControlledState>
            </FontManagerProvider>
          </CanvasKitProvider>
        </ImageCacheProvider>
      </Suspense>
    </AyonProvider>
  );
});
