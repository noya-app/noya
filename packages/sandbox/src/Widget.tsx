import { useApplicationState } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import {
  AffineTransform,
  createRect,
  Rect,
  transformRect,
} from 'noya-geometry';
import { DrawableLayerType, Layers, Selectors } from 'noya-state';
import * as React from 'react';
import { useEffect, useRef } from 'react';
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
        background: 'black',
        color: 'white',
        pointerEvents: 'all',
        padding: '2px 4px',
        whiteSpace: 'pre',
        borderRadius: '4px',
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
  const rect = useGetScreenRect()(layer.frame);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const symbol = Layers.isSymbolInstance(layer)
    ? Selectors.getSymbolMaster(state, layer.symbolID)
    : undefined;

  const isSelected = state.selectedLayerIds.includes(layer.do_objectID);

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

  const blockTypes = inferBlockTypes({ rect });

  return (
    <WidgetContainer frame={rect}>
      {isSelected && <WidgetLabel>✨ {symbol?.name ?? layer.name}</WidgetLabel>}

      <textarea
        ref={textareaRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: isEditing ? '#fff' : '#eee',
          pointerEvents: isEditing ? 'all' : 'none',
          padding: 4,
          resize: 'none',
        }}
        disabled={!isEditing}
        onChange={(event) => {
          dispatch('setBlockText', event.target.value);
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
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 32px)',
            right: 0,
            background: 'black',
            color: 'white',
            pointerEvents: 'all',
            padding: '2px 4px',
            whiteSpace: 'pre',
            borderRadius: '4px',
          }}
        >
          {blockTypes.map((blockType) => {
            const symbol =
              typeof blockType.type === 'string'
                ? undefined
                : Selectors.getSymbolMaster(state, blockType.type.symbolId);
            return (
              <div
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onChangeBlockType(blockType.type);
                }}
              >
                {blockType.score}{' '}
                {typeof blockType.type === 'string'
                  ? blockType.type
                  : symbol?.name ?? blockType.type.symbolId}
              </div>
            );
          })}
        </div>
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
