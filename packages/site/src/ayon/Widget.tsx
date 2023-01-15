import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { Spacer } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import {
  AffineTransform,
  createRect,
  Rect,
  transformRect,
} from 'noya-geometry';
import { LockClosedIcon, MagicWandIcon } from 'noya-icons';
import { DrawableLayerType, Layers, Selectors } from 'noya-state';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
  allAyonSymbols,
  heading1SymbolId,
  heading2SymbolId,
  heading3SymbolId,
  heading4SymbolId,
  heading5SymbolId,
  heading6SymbolId,
  textSymbolId,
} from './symbols';
import { BlockHeuristicInput, InferredBlockTypeResult } from './types';

function useGetScreenRect() {
  const [state] = useApplicationState();
  const meta = Selectors.getCurrentPageMetadata(state);
  const { zoomValue, scrollOrigin } = meta;

  const screenTransform = AffineTransform.scale(1 / zoomValue)
    .translate(-scrollOrigin.x, -scrollOrigin.y)
    .invert();

  return (frame: Rect) => transformRect(frame, screenTransform);
}

function WidgetContainer({
  frame,
  children,
}: {
  frame: Rect;
  children: React.ReactNode;
}) {
  return (
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
        zIndex: 1,
        fontSize: 13,
        display: 'flex',
        lineHeight: '1.2',
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
}: {
  layer: Sketch.AnyLayer;
  inferBlockTypes: (input: BlockHeuristicInput) => InferredBlockTypeResult[];
  onChangeBlockType: (type: DrawableLayerType) => void;
}) {
  const [state, dispatch] = useApplicationState();
  const { isContextMenuOpen } = useWorkspace();
  const rect = useGetScreenRect()(layer.frame);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const symbol = Layers.isSymbolInstance(layer)
    ? Selectors.getSymbolMaster(state, layer.symbolID)
    : undefined;

  const isSelected = state.selectedLayerIds[0] === layer.do_objectID;

  const isEditing =
    state.interactionState.type === 'editingBlock' &&
    state.interactionState.layerId === layer.do_objectID;

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  if (!Layers.isSymbolInstance(layer)) return null;

  const blockText = layer.blockText ?? '';

  const blockTypes = inferBlockTypes({ rect, text: blockText });

  const showWidgetUI =
    isSelected &&
    !isContextMenuOpen &&
    state.interactionState.type !== 'drawing';

  return (
    <WidgetContainer frame={rect}>
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
        }}
        disabled={!isEditing}
        onChange={(event) => {
          const text = event.target.value;
          const words = text.split(' ');
          const lines = text.split(/\r?\n/);

          if (
            words.length > 1 &&
            Object.keys(BLOCK_TYPE_TEXT_SHORTCUTS).includes(words[0])
          ) {
            onChangeBlockType({
              symbolId: BLOCK_TYPE_TEXT_SHORTCUTS[words[0]],
            });
            dispatch('setSymbolIdIsFixed', true);
            dispatch('setBlockText', words.slice(1).join(' '));
            return;
          }

          if (words.length > 1 && text.charAt(0) === '/') {
            const symbol = allAyonSymbols.find(
              (symbol) =>
                symbol.name.toLowerCase() ===
                words[0].substring(1).toLowerCase(),
            );
            if (symbol) {
              onChangeBlockType({ symbolId: symbol.symbolID });
              dispatch('setSymbolIdIsFixed', true);
              dispatch('setBlockText', words.slice(1).join(' '));
              return;
            }
          }

          if (lines.length > 1 && text.charAt(0) === '/') {
            const symbol = allAyonSymbols.find(
              (symbol) =>
                symbol.name.toLowerCase() ===
                lines[0].substring(1).toLowerCase(),
            );
            if (symbol) {
              onChangeBlockType({ symbolId: symbol.symbolID });
              dispatch('setSymbolIdIsFixed', true);
              dispatch('setBlockText', words.slice(1).join(' '));
              return;
            }
          }

          dispatch('setBlockText', text);
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
            {layer.symbolIDIsFixed ? (
              <LockClosedIcon
                onClick={() => {
                  dispatch('setSymbolIdIsFixed', false);
                }}
              />
            ) : (
              <MagicWandIcon
                style={{ position: 'relative', top: '1px' }}
                onClick={() => {
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
              padding: '1px 4px',
              whiteSpace: 'pre',
              borderRadius: '2px',
              fontSize: 13,
              zIndex: 1,
            }}
          >
            {blockTypes.map((blockType) => {
              const name =
                typeof blockType.type === 'string'
                  ? blockType.type
                  : Selectors.getSymbolMaster(state, blockType.type.symbolId)
                      .name;

              return (
                <div
                  key={name}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    onChangeBlockType(blockType.type);
                    dispatch('setSymbolIdIsFixed', true);
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
  const getScreenRect = useGetScreenRect();

  if (state.interactionState.type !== 'drawing') return null;

  const block = inferBlockType({
    rect: createRect(
      state.interactionState.origin,
      state.interactionState.current,
    ),
  });

  if (typeof block === 'string') return null;

  const symbol = Selectors.getSymbolMaster(state, block.symbolId);

  const rect = getScreenRect(
    createRect(state.interactionState.origin, state.interactionState.current),
  );

  return (
    <WidgetContainer frame={rect}>
      <WidgetLabel>✨ {symbol.name}</WidgetLabel>
    </WidgetContainer>
  );
}
