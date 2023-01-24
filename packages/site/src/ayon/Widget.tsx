import { fileOpen } from 'browser-fs-access';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { DividerVertical, Spacer } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { createRect, Rect, transformRect } from 'noya-geometry';
import {
  LockClosedIcon,
  MagicWandIcon,
  ReloadIcon,
  UploadIcon,
} from 'noya-icons';
import { DrawableLayerType, Layers, Selectors } from 'noya-state';
import * as React from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { filterHashTagsAndSlashCommands } from './DOMRenderer';
import { Stacking } from './stacking';
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
} from './symbols';
import { BlockHeuristicInput, InferredBlockTypeResult } from './types';

function WidgetContainer({
  frame,
  children,
  transform,
  zIndex,
}: {
  frame: Rect;
  children: React.ReactNode;
  transform?: string;
  zIndex?: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        transform,
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
      </div>
    </div>
  );
}

function WidgetLabel({
  children,
  onPointerDown,
}: {
  children: React.ReactNode;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        right: 0,
        background: 'whitesmoke',
        border: '1px solid rgba(0,0,0,0.1)',
        color: 'black',
        pointerEvents: 'all',
        padding: '2px 4px',
        whiteSpace: 'pre',
        borderRadius: '2px',
        fontSize: 13,
        display: 'flex',
        lineHeight: '1.2',
        cursor: 'default',
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onPointerDown?.(event);
      }}
    >
      {children}
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
  inferBlockTypes: (input: BlockHeuristicInput) => InferredBlockTypeResult[];
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
  const parent = Selectors.getParentLayer(page, indexPath);

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

  const blockTypes = inferBlockTypes({ rect, text: blockText });

  const showWidgetUI =
    isSelected &&
    !isContextMenuOpen &&
    state.interactionState.type !== 'drawing';

  const words = blockText.split(/\s/);
  const slashWords = words.filter((word) => word[0] === '/' && word !== '/');

  return (
    <WidgetContainer
      frame={rect}
      transform={canvasTransform.toString()}
      zIndex={showWidgetUI ? Stacking.level.interactive : undefined}
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
      {showWidgetUI && (
        <>
          <WidgetLabel>
            {layer.symbolID === imageSymbolId && (
              <>
                {layer.resolvedBlockData && (
                  <>
                    <ReloadIcon
                      style={{ cursor: 'pointer' }}
                      onClick={(event) => {
                        event.preventDefault();

                        dispatch(
                          'setResolvedBlockData',
                          layer.do_objectID,
                          undefined,
                        );
                      }}
                    />
                    <Spacer.Horizontal size={4} />
                    <DividerVertical variant="strong" />
                    <Spacer.Horizontal size={4} />
                  </>
                )}
                <UploadIcon
                  style={{ cursor: 'pointer' }}
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
                <Spacer.Horizontal size={4} />
                <DividerVertical variant="strong" />
                <Spacer.Horizontal size={4} />
              </>
            )}
            {layer.symbolIDIsFixed ? (
              <LockClosedIcon
                style={{ cursor: 'pointer' }}
                onPointerDown={(event) => {
                  event.preventDefault();

                  dispatch('setSymbolIdIsFixed', false);
                }}
              />
            ) : (
              <MagicWandIcon
                style={{ position: 'relative', top: '1px', cursor: 'pointer' }}
                onPointerDown={(event) => {
                  event.preventDefault();

                  dispatch('setSymbolIdIsFixed', true);
                }}
              />
            )}
            <Spacer.Horizontal size={4} />
            {symbol?.name ?? layer.name}
          </WidgetLabel>
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 36px)',
              right: 0,
              background: 'whitesmoke',
              border: '1px solid rgba(0,0,0,0.1)',
              color: 'black',
              pointerEvents: 'all',
              whiteSpace: 'pre',
              borderRadius: '2px',
              fontSize: 13,
              cursor: 'default',
            }}
          >
            {blockTypes.map((blockType, index) => {
              const name =
                typeof blockType.type === 'string'
                  ? blockType.type
                  : Selectors.getSymbolMaster(state, blockType.type.symbolId)
                      .name;

              return (
                <div
                  key={name}
                  onPointerDown={(event) => {
                    // Prevent default so the textarea doesn't lose focus
                    event.preventDefault();
                    event.stopPropagation();
                    onChangeBlockType(blockType.type);

                    // Remove any slash commands
                    const blockTextWithoutSlashCommands = blockText.replace(
                      /^\/\w+/,
                      '',
                    );
                    dispatch(
                      'setBlockText',
                      blockTextWithoutSlashCommands,
                      filterHashTagsAndSlashCommands(
                        blockTextWithoutSlashCommands,
                      ).content,
                    );
                    dispatch('setSymbolIdIsFixed', true);
                  }}
                  style={{
                    padding: '1px 4px',
                    backgroundColor:
                      index === 0 && slashWords.length > 0
                        ? 'rgb(132,63,255)'
                        : 'transparent',
                    color:
                      index === 0 && slashWords.length > 0 ? '#fff' : '#000',
                    cursor: 'pointer',
                  }}
                >
                  {blockType.score.toFixed(2)} {name}
                </div>
              );
            })}
          </div>
        </>
      )}
    </WidgetContainer>
  );
}

export function DrawingWidget({
  inferBlockType,
}: {
  inferBlockType: ({ rect }: { rect: Rect }) => DrawableLayerType;
}) {
  const [state] = useApplicationState();
  const { canvasInsets } = useWorkspace();
  const transform = Selectors.getCanvasTransform(state, canvasInsets);

  if (state.interactionState.type !== 'drawing') return null;

  const block = inferBlockType({
    rect: createRect(
      state.interactionState.origin,
      state.interactionState.current,
    ),
  });

  if (typeof block === 'string') return null;

  const symbol = Selectors.getSymbolMaster(state, block.symbolId);

  const rect = transformRect(
    createRect(state.interactionState.origin, state.interactionState.current),
    transform,
  );

  return (
    <WidgetContainer frame={rect}>
      <WidgetLabel>✨ {symbol.name}</WidgetLabel>
    </WidgetContainer>
  );
}
