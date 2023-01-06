import { useApplicationState } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import {
  AffineTransform,
  createRect,
  Rect,
  transformRect,
} from 'noya-geometry';
import {
  DrawableLayerType,
  InteractionState,
  Layers,
  Selectors,
} from 'noya-state';
import * as React from 'react';

export function useWidget({ frame }: { frame: Rect }) {
  const [state] = useApplicationState();
  const meta = Selectors.getCurrentPageMetadata(state);
  const { zoomValue, scrollOrigin } = meta;

  const screenTransform = AffineTransform.scale(1 / zoomValue)
    .translate(-scrollOrigin.x, -scrollOrigin.y)
    .invert();

  return { frame: transformRect(frame, screenTransform) };
}

export function WidgetCore({
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
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Widget({ layer }: { layer: Sketch.AnyLayer }) {
  const [state] = useApplicationState();
  const { frame } = useWidget({ frame: layer.frame });

  const symbol = Layers.isSymbolInstance(layer)
    ? Selectors.getSymbolMaster(state, layer.symbolID)
    : undefined;

  const isSelected = state.selectedLayerIds.includes(layer.do_objectID);

  if (!isSelected) return null;

  return <WidgetCore frame={frame}>✨ {symbol?.name ?? layer.name}</WidgetCore>;
}

export function DrawingWidget({
  inferBlock,
}: {
  inferBlock: (
    interactionState: Extract<InteractionState, { type: 'drawing' }>,
  ) => DrawableLayerType;
}) {
  const [state] = useApplicationState();

  if (state.interactionState.type !== 'drawing') return null;

  const block = inferBlock(state.interactionState);

  if (typeof block === 'string') return null;

  const symbol = Selectors.getSymbolMaster(state, block.symbolId);

  const rect = createRect(
    state.interactionState.origin,
    state.interactionState.current,
  );

  return <WidgetCore frame={rect}>✨ {symbol.name}</WidgetCore>;
}
