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
        background: 'red',
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

export function Widget({ layer }: { layer: Sketch.AnyLayer }) {
  const [state] = useApplicationState();
  const rect = useGetScreenRect()(layer.frame);

  const symbol = Layers.isSymbolInstance(layer)
    ? Selectors.getSymbolMaster(state, layer.symbolID)
    : undefined;

  const isSelected = state.selectedLayerIds.includes(layer.do_objectID);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditing, setIsEditing] = React.useState(false);

  if (!isSelected) return null;

  return (
    <WidgetContainer frame={rect}>
      <WidgetLabel>✨ {symbol?.name ?? layer.name}</WidgetLabel>
      {!isEditing && (
        <div
          style={{
            position: 'absolute',
            inset: 10,
            background: 'blue',
            pointerEvents: 'all',
          }}
        ></div>
      )}
      {isEditing && (
        <div
          style={{
            position: 'absolute',
            inset: 10,
            background: 'blue',
            pointerEvents: 'all',
          }}
          contentEditable
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
        />
      )}
    </WidgetContainer>
  );
}

export function DrawingWidget({
  inferBlock,
}: {
  inferBlock: ({ rect }: { rect: Rect }) => DrawableLayerType;
}) {
  const [state] = useApplicationState();
  const getScreenRect = useGetScreenRect();

  if (state.interactionState.type !== 'drawing') return null;

  const block = inferBlock({
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
