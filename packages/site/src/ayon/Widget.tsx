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
import { useEffect, useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  allAyonSymbols,
  heading1SymbolId,
  heading2SymbolId,
  heading3SymbolId,
  heading4SymbolId,
  heading5SymbolId,
  heading6SymbolId,
  imageSymbolId,
  textSymbolId,
} from './blocks/symbols';
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
}: {
  frame: Rect;
  children?: React.ReactNode;
  transform?: AffineTransform;
  zIndex?: number;
  footer?: React.ReactNode;
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
      </div>
    </div>
  );
}

const BLOCK_TYPE_TEXT_SHORTCUTS: { [shortcut: string]: string } = {
  '#': heading1SymbolId,
  '##': heading2SymbolId,
  '###': heading3SymbolId,
  '####': heading4SymbolId,
  '#####': heading5SymbolId,
  '######': heading6SymbolId,
  '"': textSymbolId,
};

export function Widget({
  layer,
  inferBlockTypes,
  onChangeBlockType,
  uploadAsset,
}: {
  layer: Sketch.AnyLayer;
  inferBlockTypes: (input: InferBlockProps) => InferredBlockTypeResult[];
  onChangeBlockType: (type: DrawableLayerType) => void;
  uploadAsset: (file: ArrayBuffer) => Promise<string>;
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

  const isSelected = state.selectedLayerIds[0] === layer.do_objectID;

  const isEditing =
    state.interactionState.type === 'editingBlock' &&
    state.interactionState.layerId === layer.do_objectID;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  useLayoutEffect(() => {
    const handler = (event: FocusEvent) => {
      if (event.target !== textareaRef.current) return;

      const canvasInput = document.querySelector('#hidden-canvas-input');

      if (canvasInput instanceof HTMLInputElement) {
        canvasInput.focus();
      }

      event.preventDefault();
    };

    window.addEventListener('blur', handler, { capture: true });

    return () => {
      window.removeEventListener('blur', handler, { capture: true });
    };
  }, []);

  if (!Layers.isSymbolInstance(layer)) return null;

  const blockText = layer.blockText ?? '';

  const blockTypes = inferBlockTypes({
    frame: rect,
    blockText,
    siblingBlocks: getSiblingBlocks(state),
  });

  const showWidgetUI =
    isSelected &&
    !isContextMenuOpen &&
    state.interactionState.type !== 'drawing';

  const words = blockText.split(/\s/);
  const slashWords = words.filter((word) => word[0] === '/' && word !== '/');

  return (
    <WidgetContainer
      frame={rect}
      transform={canvasTransform}
      zIndex={showWidgetUI ? Stacking.level.interactive : undefined}
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
                              blockTextWithoutSlashCommands,
                              filterHashTagsAndSlashCommands(
                                blockTextWithoutSlashCommands,
                              ).content,
                            );
                            dispatch('setSymbolIdIsFixed', true);
                          }}
                          active={index === 0 && slashWords.length > 0}
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
      <textarea
        ref={textareaRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: isEditing ? '#fff' : '#eee',
          pointerEvents: isEditing ? 'all' : 'none',
          padding: 4,
          resize: 'none',
          border: '1px solid rgba(0,0,0,0.1)',
          // Children of the page don't appear in the rendered output, so we make them transparent.
          opacity: Layers.isPageLayer(parent) ? 0.3 : 0.8,
        }}
        disabled={!isEditing}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            dispatch('interaction', ['reset']);
            dispatch('selectLayer', []);
            event.preventDefault();
            return;
          }

          if (event.key !== 'Tab') {
            return;
          }

          event.preventDefault();

          const words = blockText.split(/\s/);
          const slashWords = words.filter(
            (word) => word[0] === '/' && word !== '/',
          );

          if (slashWords.length > 0) {
            const symbol = allAyonSymbols.find(
              (symbol) =>
                symbol.name.toLowerCase() ===
                slashWords[slashWords.length - 1].substring(1).toLowerCase(),
            );
            const newText = blockText
              .split(/\r?\n/)
              .map((line) =>
                line
                  .split(' ')
                  .filter((word) => word[0] !== '/' || word === '/')
                  .join(' '),
              )
              .join('\n');
            if (symbol) {
              onChangeBlockType({ symbolId: symbol.symbolID });
              dispatch('setSymbolIdIsFixed', true);
              dispatch(
                'setBlockText',
                newText,
                filterHashTagsAndSlashCommands(newText).content,
              );
              return;
            } else if (
              blockTypes.length > 0 &&
              typeof blockTypes[0].type !== 'string'
            ) {
              onChangeBlockType({
                symbolId: blockTypes[0].type.symbolId,
              });
              dispatch('setSymbolIdIsFixed', true);
              dispatch(
                'setBlockText',
                newText,
                filterHashTagsAndSlashCommands(newText).content,
              );
              return;
            }
          }
        }}
        onChange={(event) => {
          const text = event.target.value;
          const words = text.split(/\s/);
          const slashWords = words.filter(
            (word) => word[0] === '/' && word !== '/',
          );

          if (
            words.length > blockText.split(' ').length &&
            Object.keys(BLOCK_TYPE_TEXT_SHORTCUTS).includes(words[0])
          ) {
            onChangeBlockType({
              symbolId: BLOCK_TYPE_TEXT_SHORTCUTS[words[0]],
            });
            dispatch('setSymbolIdIsFixed', true);
            dispatch(
              'setBlockText',
              words.slice(1).join(' '),
              filterHashTagsAndSlashCommands(words.slice(1).join(' ')).content,
            );
            return;
          }

          if (
            slashWords.length > 0 &&
            words.length > blockText.split(/\s/).length
          ) {
            const symbol = allAyonSymbols.find(
              (symbol) =>
                symbol.name.toLowerCase() ===
                slashWords[slashWords.length - 1].substring(1).toLowerCase(),
            );
            const newText = text
              .split(/\r?\n/)
              .map((line) =>
                line
                  .split(' ')
                  .filter((word) => word[0] !== '/' || word === '/')
                  .join(' '),
              )
              .join('\n');
            if (symbol) {
              onChangeBlockType({ symbolId: symbol.symbolID });
              dispatch('setSymbolIdIsFixed', true);
              dispatch(
                'setBlockText',
                newText,
                filterHashTagsAndSlashCommands(newText).content,
              );
              return;
            } else if (
              blockTypes.length > 0 &&
              typeof blockTypes[0].type !== 'string'
            ) {
              onChangeBlockType({
                symbolId: blockTypes[0].type.symbolId,
              });
              dispatch('setSymbolIdIsFixed', true);
              dispatch(
                'setBlockText',
                newText,
                filterHashTagsAndSlashCommands(newText).content,
              );
              return;
            }
          }

          dispatch(
            'setBlockText',
            text,
            filterHashTagsAndSlashCommands(text).content,
          );
        }}
        onFocusCapture={(event) => {
          event.stopPropagation();
        }}
        onPointerDownCapture={(event) => {
          event.stopPropagation();
        }}
        onPointerMoveCapture={(event) => {
          event.stopPropagation();
        }}
        onPointerUpCapture={(event) => {
          event.stopPropagation();
        }}
        value={blockText}
      />
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
