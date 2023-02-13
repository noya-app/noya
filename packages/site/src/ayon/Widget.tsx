import { fileOpen } from 'browser-fs-access';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import {
  Button,
  Chip,
  Divider,
  DividerVertical,
  DropdownMenu,
  IconButton,
  Popover,
  Small,
  Spacer,
  Stack,
  useDesignSystemTheme,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { AffineTransform, Rect, transformRect } from 'noya-geometry';
import { ChevronDownIcon } from 'noya-icons';
import {
  DrawableLayerType,
  getSiblingBlocks,
  InferBlockProps,
  Layers,
  Selectors,
} from 'noya-state';
import * as React from 'react';
import { forwardRef, ReactNode, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AyonOnboardingStep } from '../utils/clientStorage';
import { BlockEditor, IBlockEditor } from './BlockEditor';
import { imageSymbolId } from './blocks/symbols';
import { Stacking } from './stacking';
import { InferredBlockTypeResult } from './types';

const ContentElement = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  borderRadius: 4,
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  color: theme.colors.textMuted,
}));

function WidgetContainer({
  frame,
  children,
  transform,
  zIndex,
  footer,
  label,
}: {
  frame: Rect;
  children?: React.ReactNode;
  transform?: AffineTransform;
  zIndex?: number;
  footer?: React.ReactNode;
  label?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        transform: transform?.toString(),
        zIndex,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
          pointerEvents: 'none',
        }}
      >
        {children}
        {footer && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100%)',
              right: 0,
              pointerEvents: 'all',
              cursor: 'default',
              whiteSpace: 'pre',
              display: 'flex',
              transformOrigin: 'top right',
              transform: AffineTransform.scale(
                transform ? 1 / transform.scaleComponents.x : 1,
                transform ? 1 / transform.scaleComponents.y : 1,
              )
                .translate(0, 6)
                .toString(),
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onPointerMove={(event) => {
              event.stopPropagation();
            }}
          >
            {footer}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            whiteSpace: 'pre',
            display: 'flex',
            transformOrigin: 'bottom right',
            transform: AffineTransform.scale(
              transform ? 1 / transform.scaleComponents.x : 1,
              transform ? 1 / transform.scaleComponents.y : 1,
            )
              .translate(-8, -4)
              .toString(),
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function BlockTypeOnboardingPopover({
  show,
  setOnboardingStep,
  trigger,
}: {
  show: boolean;
  setOnboardingStep?: (step: AyonOnboardingStep) => void;
  trigger: ReactNode;
}) {
  if (!show) return <>{trigger}</>;

  return (
    <Popover
      trigger={trigger}
      open={show}
      closable
      side="right"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
      }}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
      }}
      onClickClose={() => {
        setOnboardingStep?.('configuredBlockType');
      }}
    >
      <Stack.V width={300} padding={20} gap={10} alignItems="start">
        <Small fontWeight={'bold'}>Step 2: Choose Block Type</Small>
        <Small>Noya chooses a default block type automatically.</Small>
        <Small>You can change the block type by clicking this dropdown.</Small>
        <Small>
          You can also type slash{' '}
          <Chip style={{ fontSize: '13px' }} variant="secondary">
            /
          </Chip>{' '}
          within the block to search block types.
        </Small>
      </Stack.V>
    </Popover>
  );
}

function BlockContentOnboardingPopover({
  show,
  setOnboardingStep,
  trigger,
}: {
  show: boolean;
  setOnboardingStep?: (step: AyonOnboardingStep) => void;
  trigger: ReactNode;
}) {
  if (!show) return <>{trigger}</>;

  return (
    <Popover
      trigger={trigger}
      open={show}
      closable
      side="right"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
      }}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
      }}
      onClickClose={() => {
        setOnboardingStep?.('configuredBlockText');
      }}
    >
      <Stack.V width={300} padding={20} gap={10} alignItems="start">
        <Small fontWeight={'bold'}>Step 3: Set Block Content</Small>
        <Small>
          Many blocks are customizable. Double click a block or press{' '}
          <Chip variant="secondary">Enter</Chip> to edit its content.
        </Small>
        <Small>
          You can also type hashtag <Chip variant="secondary">#</Chip> commands
          to change the block's style.
        </Small>
      </Stack.V>
    </Popover>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TopSuggestions({
  currentBlockType,
  blockTypes,
  blockText,
  onChangeBlockType,
  onChangeBlockText,
}: {
  currentBlockType: string;
  blockTypes: InferredBlockTypeResult[];
  blockText: string;
  onChangeBlockType: (type: DrawableLayerType) => void;
  onChangeBlockText: (text: string) => void;
}) {
  const theme = useDesignSystemTheme();
  const [state, dispatch] = useApplicationState();

  return (
    <ContentElement>
      <Stack.V padding={'0 6px'}>
        <Stack.H padding={'4px 0px'} gap={8}>
          <Small color="textSubtle" flex="1">
            Top Suggestions
          </Small>
          <IconButton
            iconName="Cross2Icon"
            color={theme.colors.textDisabled}
            onPointerDown={(event) => {
              event.preventDefault();

              dispatch('setSymbolIdIsFixed', undefined, true);
            }}
          />
        </Stack.H>

        <Divider overflow={8} />
        {blockTypes
          // Remove the current block type
          .filter(
            (blockType) =>
              typeof blockType.type === 'string' ||
              blockType.type.symbolId !== currentBlockType,
          )
          .slice(0, 3)
          .map((blockType, index) => {
            const name =
              typeof blockType.type === 'string'
                ? blockType.type
                : Selectors.getSymbolMaster(state, blockType.type.symbolId)
                    .name;

            return (
              <Button
                key={name}
                variant="thin"
                onPointerDown={(event) => {
                  // Prevent default so the textarea doesn't lose focus
                  event.preventDefault();
                  event.stopPropagation();

                  onChangeBlockType(blockType.type);
                  onChangeBlockText(blockText);
                }}
              >
                {name}
                <Spacer.Horizontal />
              </Button>
            );
          })}
      </Stack.V>
    </ContentElement>
  );
}

export const Widget = forwardRef(function Widget(
  {
    layer,
    inferBlockTypes,
    onChangeBlockType,
    onChangeBlockText,
    uploadAsset,
    onFocusCanvas,
    onboardingStep,
    setOnboardingStep,
  }: {
    layer: Sketch.AnyLayer;
    inferBlockTypes: (input: InferBlockProps) => InferredBlockTypeResult[];
    onChangeBlockType: (type: DrawableLayerType) => void;
    onChangeBlockText: (text: string) => void;
    uploadAsset: (file: ArrayBuffer) => Promise<string>;
    onFocusCanvas: () => void;
    onboardingStep?: AyonOnboardingStep;
    setOnboardingStep?: (step: AyonOnboardingStep) => void;
  },
  forwardedRef: React.Ref<HTMLDivElement>,
) {
  const { canvasInsets } = useWorkspace();
  const [state, dispatch] = useApplicationState();
  const { isContextMenuOpen } = useWorkspace();
  const page = Selectors.getCurrentPage(state);
  const rect = Selectors.getBoundingRect(page, [layer.do_objectID])!;
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const indexPath = Layers.findIndexPath(
    page,
    (l) => l.do_objectID === layer.do_objectID,
  )!;
  const parent = Selectors.getParentLayer(page, indexPath) as Sketch.Artboard;

  const symbol = Layers.isSymbolInstance(layer)
    ? Selectors.getSymbolMaster(state, layer.symbolID)
    : undefined;

  const isPrimarySelected = state.selectedLayerIds[0] === layer.do_objectID;
  const isSelected = state.selectedLayerIds.includes(layer.do_objectID);

  const isEditing =
    state.interactionState.type === 'editingBlock' &&
    state.interactionState.layerId === layer.do_objectID;

  const blockEditorRef = useRef<IBlockEditor>(null);

  useEffect(() => {
    if (isEditing) {
      blockEditorRef.current?.focus();
    }
  }, [isEditing]);

  if (!Layers.isSymbolInstance(layer)) return null;

  const blockText = layer.blockText ?? '';

  const blockTypes = inferBlockTypes({
    frame: rect,
    blockText,
    siblingBlocks: getSiblingBlocks(state),
  });

  const showWidgetUI =
    isPrimarySelected &&
    !isContextMenuOpen &&
    state.interactionState.type !== 'drawing' &&
    state.interactionState.type !== 'marquee' &&
    state.selectedLayerIds.length === 1;

  const showTypeOnboarding = onboardingStep === 'insertedBlock';
  const showTextOnboarding = onboardingStep === 'configuredBlockType';

  return (
    <WidgetContainer
      frame={rect}
      transform={canvasTransform}
      zIndex={showWidgetUI ? Stacking.level.interactive : undefined}
      label={
        !showWidgetUI && (
          <Small opacity={0.5}>{symbol?.name ?? layer.name}</Small>
        )
      }
      footer={
        showWidgetUI && (
          <Stack.V gap={6} alignItems="flex-end">
            <BlockTypeOnboardingPopover
              show={showTypeOnboarding}
              setOnboardingStep={setOnboardingStep}
              trigger={
                <ContentElement>
                  <Stack.H
                    flex="1"
                    padding={'4px 6px'}
                    gap={6}
                    separator={
                      <DividerVertical variant="strong" overflow={4} />
                    }
                  >
                    {layer.symbolID === imageSymbolId &&
                      layer.resolvedBlockData && (
                        <IconButton
                          key="reload"
                          iconName="ReloadIcon"
                          onClick={(event) => {
                            event.preventDefault();

                            dispatch(
                              'setResolvedBlockData',
                              layer.do_objectID,
                              undefined,
                            );
                          }}
                        />
                      )}
                    {layer.symbolID === imageSymbolId && (
                      <IconButton
                        iconName="UploadIcon"
                        onPointerDown={async (event) => {
                          event.preventDefault();

                          const file = await fileOpen({
                            extensions: ['.png', '.jpg', '.webp'],
                            mimeTypes: [
                              'image/png',
                              'image/jpeg',
                              'image/webp',
                            ],
                          });

                          const url = await uploadAsset(
                            await file.arrayBuffer(),
                          );

                          dispatch('interaction', ['reset']);
                          dispatch('selectLayer', []);
                          onChangeBlockText(url);
                        }}
                      />
                    )}
                    <Stack.H>
                      <DropdownMenu
                        items={blockTypes
                          .flatMap(({ type }) =>
                            typeof type === 'string' ? [] : [type.symbolId],
                          )
                          .map((symbolId) => {
                            const symbolMaster = Selectors.getSymbolMaster(
                              state,
                              symbolId,
                            );

                            return {
                              title: symbolMaster.name,
                              value: symbolId,
                            };
                          })}
                        onSelect={(symbolId) => {
                          onChangeBlockType({ symbolId });
                          dispatch('setSymbolIdIsFixed', undefined, true);
                        }}
                      >
                        <Button variant="none">
                          {symbol?.name ?? layer.name}
                          <Spacer.Horizontal size={4} />
                          <ChevronDownIcon />
                        </Button>
                      </DropdownMenu>
                    </Stack.H>
                  </Stack.H>
                </ContentElement>
              }
            />
            {/* {!showTypeOnboarding &&
              !showTextOnboarding &&
              !layer.symbolIDIsFixed && (
                <TopSuggestions
                  blockText={blockText}
                  blockTypes={blockTypes}
                  onChangeBlockType={onChangeBlockType}
                  onChangeBlockText={onChangeBlockText}
                  currentBlockType={layer.symbolID}
                />
              )} */}
          </Stack.V>
        )
      }
    >
      <BlockContentOnboardingPopover
        show={showTextOnboarding}
        setOnboardingStep={setOnboardingStep}
        trigger={
          <div
            ref={forwardedRef}
            style={{
              position: 'absolute',
              inset: 1,
              background: isEditing ? '#fff' : '#eee',
              // If the layer is selected, we render an outline at the canvas
              // level already and don't need one here
              outline: isSelected ? 'none' : `1px solid #ddd`,
              pointerEvents: isEditing ? 'all' : 'none',
              // Children of the page don't appear in the rendered output,
              // so we make them partially transparent
              opacity: Layers.isPageLayer(parent) ? 0.3 : isEditing ? 0.9 : 0.7,
              overflow: 'hidden',
              cursor: isEditing ? 'text' : 'pointer',
            }}
            onFocusCapture={(event) => event.stopPropagation()}
            onPointerDownCapture={(event) => event.stopPropagation()}
            onPointerMoveCapture={(event) => event.stopPropagation()}
            onPointerUpCapture={(event) => event.stopPropagation()}
          >
            <BlockEditor
              ref={blockEditorRef}
              isEditing={isEditing}
              isSelected={isSelected}
              blockTypes={blockTypes}
              blockText={blockText}
              layer={layer}
              parent={parent}
              onChangeBlockType={onChangeBlockType}
              onChangeBlockText={onChangeBlockText}
              onFocusCanvas={onFocusCanvas}
            />
          </div>
        }
      />
    </WidgetContainer>
  );
});

export function DrawingWidget() {
  const [state] = useApplicationState();
  const { canvasInsets } = useWorkspace();
  const transform = Selectors.getCanvasTransform(state, canvasInsets);

  if (state.interactionState.type !== 'drawing') return null;

  const block = state.interactionState.shapeType;

  if (typeof block === 'string') return null;

  const symbol = Selectors.getSymbolMaster(state, block.symbolId);

  const rect = transformRect(
    Selectors.getDrawnLayerRect(
      state.interactionState.origin,
      state.interactionState.current,
      state.interactionState.options,
    ),
    transform,
  );

  return (
    <WidgetContainer
      frame={rect}
      zIndex={Stacking.level.interactive}
      footer={
        <ContentElement>
          <Stack.H flex="1" padding={'4px 6px'}>
            <Button variant="none">
              {symbol?.name}
              <Spacer.Horizontal size={4} />
              <ChevronDownIcon />
            </Button>
          </Stack.H>
        </ContentElement>
      }
    />
  );
}
