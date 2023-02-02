import { fileOpen } from 'browser-fs-access';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import {
  Button,
  Divider,
  DividerVertical,
  DropdownMenu,
  IconButton,
  Small,
  Spacer,
  Stack,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import {
  AffineTransform,
  createRect,
  Rect,
  transformRect,
} from 'noya-geometry';
import { ChevronDownIcon } from 'noya-icons';
import {
  DrawableLayerType,
  getSiblingBlocks,
  InferBlockProps,
  Layers,
  Selectors,
} from 'noya-state';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { BlockEditor, IBlockEditor } from './BlockEditor';
import { imageSymbolId } from './blocks/symbols';
import { filterHashTagsAndSlashCommands } from './parse';
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

export function Widget({
  layer,
  inferBlockTypes,
  onChangeBlockType,
  uploadAsset,
  onFocusCanvas,
}: {
  layer: Sketch.AnyLayer;
  inferBlockTypes: (input: InferBlockProps) => InferredBlockTypeResult[];
  onChangeBlockType: (type: DrawableLayerType) => void;
  uploadAsset: (file: ArrayBuffer) => Promise<string>;
  onFocusCanvas: () => void;
}) {
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
    state.interactionState.type !== 'drawing';

  const words = blockText.split(/\s/);
  const slashWords = words.filter((word) => word[0] === '/' && word !== '/');

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
            <ContentElement>
              <Stack.H
                flex="1"
                padding={'4px 6px'}
                gap={6}
                separator={<DividerVertical variant="strong" overflow={4} />}
              >
                {layer.symbolID === imageSymbolId && layer.resolvedBlockData && (
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
                        mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
                      });

                      const url = await uploadAsset(await file.arrayBuffer());

                      dispatch(
                        'setBlockText',
                        undefined,
                        url,
                        filterHashTagsAndSlashCommands(url).content,
                      );
                      dispatch('setSymbolIdIsFixed', true);
                    }}
                  />
                )}
                <Stack.H>
                  {layer.symbolIDIsFixed ? (
                    <IconButton
                      iconName="LockClosedIcon"
                      onPointerDown={(event) => {
                        event.preventDefault();

                        dispatch('setSymbolIdIsFixed', false);
                      }}
                    />
                  ) : (
                    <IconButton
                      iconName="MagicWandIcon"
                      onPointerDown={(event) => {
                        event.preventDefault();

                        dispatch('setSymbolIdIsFixed', true);
                      }}
                    />
                  )}
                  <Spacer.Horizontal size={6} />
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

                        return { title: symbolMaster.name, value: symbolId };
                      })}
                    onSelect={(symbolId) => {
                      onChangeBlockType({ symbolId });
                      dispatch('setSymbolIdIsFixed', true);
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
            {(slashWords.length > 0 || !layer.symbolIDIsFixed) && (
              <ContentElement>
                <Stack.V padding={'0 8px'}>
                  <Small color="textSubtle" padding={'4px 0px'}>
                    Top Suggestions
                  </Small>
                  <Divider overflow={8} />
                  {blockTypes
                    // Remove the current block type
                    .filter(
                      (blockType) =>
                        typeof blockType.type === 'string' ||
                        blockType.type.symbolId !== layer.symbolID,
                    )
                    .slice(0, 3)
                    .map((blockType, index) => {
                      const name =
                        typeof blockType.type === 'string'
                          ? blockType.type
                          : Selectors.getSymbolMaster(
                              state,
                              blockType.type.symbolId,
                            ).name;

                      return (
                        <Button
                          key={name}
                          variant="thin"
                          onPointerDown={(event) => {
                            // Prevent default so the textarea doesn't lose focus
                            event.preventDefault();
                            event.stopPropagation();
                            onChangeBlockType(blockType.type);

                            // Remove any slash commands
                            const blockTextWithoutSlashCommands =
                              blockText.replace(/^\/\w+/, '');
                            dispatch(
                              'setBlockText',
                              undefined,
                              blockTextWithoutSlashCommands,
                              filterHashTagsAndSlashCommands(
                                blockTextWithoutSlashCommands,
                              ).content,
                            );
                            dispatch('setSymbolIdIsFixed', true);
                          }}
                        >
                          {name}
                          <Spacer.Horizontal />
                        </Button>
                      );
                    })}
                </Stack.V>
              </ContentElement>
            )}
          </Stack.V>
        )
      }
    >
      <div
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
          onFocusCanvas={onFocusCanvas}
        />
      </div>
    </WidgetContainer>
  );
}

export function DrawingWidget() {
  const [state] = useApplicationState();
  const { canvasInsets } = useWorkspace();
  const transform = Selectors.getCanvasTransform(state, canvasInsets);

  if (state.interactionState.type !== 'drawing') return null;

  const block = state.interactionState.shapeType;

  if (typeof block === 'string') return null;

  const symbol = Selectors.getSymbolMaster(state, block.symbolId);

  const rect = transformRect(
    createRect(state.interactionState.origin, state.interactionState.current),
    transform,
  );

  return (
    <WidgetContainer
      frame={rect}
      zIndex={Stacking.level.interactive}
      footer={
        <ContentElement>
          <Stack.H flex="1" padding={'4px 6px'}>
            <IconButton iconName="MagicWandIcon" />
            <Spacer.Horizontal size={6} />
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
