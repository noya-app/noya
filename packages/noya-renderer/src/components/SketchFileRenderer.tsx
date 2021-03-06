import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit-wasm';
import {
  Group,
  Rect as RCKRect,
  usePaint,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { InteractionState, Layers, Rect } from 'noya-state';
import { findIndexPath } from 'noya-state/src/layers';
import {
  getCurrentPage,
  getCurrentPageMetadata,
} from 'noya-state/src/selectors';
import { AffineTransform } from 'noya-state/src/utils/AffineTransform';
import React, { memo, useMemo } from 'react';
import { getBoundingRect, getDragHandles } from '../canvas/selection';
import HoverOutline from './HoverOutline';
import SketchLayer from './layers/SketchLayer';

const HighlightedLayerOutline = memo(function HighlightedLayerOutline({
  layer,
  transform,
}: {
  layer: Sketch.AnyLayer;
  transform: AffineTransform;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const highlightPaint = usePaint({
    color: CanvasKit.Color(132, 63, 255, 1),
    style: CanvasKit.PaintStyle.Stroke,
    strokeWidth: 2,
  });

  return (
    <HoverOutline transform={transform} layer={layer} paint={highlightPaint} />
  );
});

const BoundingRect = memo(function BoundingRect({
  selectionPaint,
  rect,
}: {
  selectionPaint: CanvasKit.Paint;
  rect: Rect;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const insetRect = useMemo(
    () => Primitives.rect(CanvasKit, Primitives.insetRect(rect, 0.5, 0.5)),
    [CanvasKit, rect],
  );

  return <RCKRect rect={insetRect} paint={selectionPaint} />;
});

const DragHandles = memo(function DragHandles({
  selectionPaint,
  rect,
}: {
  selectionPaint: CanvasKit.Paint;
  rect: Rect;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const dragHandlePaint = usePaint({
    color: CanvasKit.Color(255, 255, 255, 1),
    style: CanvasKit.PaintStyle.Fill,
  });

  const dragHandles = getDragHandles(rect);

  return (
    <>
      {dragHandles.map((handle) => (
        <React.Fragment key={handle.compassDirection}>
          <RCKRect
            rect={Primitives.rect(CanvasKit, handle.rect)}
            paint={dragHandlePaint}
          />
          <RCKRect
            rect={Primitives.rect(
              CanvasKit,
              Primitives.insetRect(handle.rect, 0.5, 0.5),
            )}
            paint={selectionPaint}
          />
        </React.Fragment>
      ))}
    </>
  );
});

const Marquee = memo(function Marquee({
  interactionState,
}: {
  interactionState: Extract<InteractionState, { type: 'marquee' }>;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const stroke = usePaint({
    color: CanvasKit.Color(220, 220, 220, 0.9),
    strokeWidth: 2,
    style: CanvasKit.PaintStyle.Stroke,
  });

  const fill = usePaint({
    color: CanvasKit.Color(255, 255, 255, 0.2),
    style: CanvasKit.PaintStyle.Fill,
  });

  const { origin, current } = interactionState;

  const rect = Primitives.rect(
    CanvasKit,
    Primitives.createRect(origin, current),
  );

  return (
    <>
      <RCKRect rect={rect} paint={stroke} />
      <RCKRect rect={rect} paint={fill} />
    </>
  );
});

export default memo(function SketchFileRenderer() {
  const { CanvasKit, state } = useReactCanvasKit();
  const page = getCurrentPage(state);
  const { scrollOrigin, zoomValue } = getCurrentPageMetadata(state);

  const transform = useMemo(
    () =>
      AffineTransform.multiply(
        AffineTransform.translation(
          scrollOrigin.x + state.canvasInsets.left,
          scrollOrigin.y,
        ),
        AffineTransform.scale(zoomValue),
      ),
    [scrollOrigin.x, scrollOrigin.y, state.canvasInsets.left, zoomValue],
  );

  const selectionPaint = usePaint({
    style: CanvasKit.PaintStyle.Stroke,
    color: CanvasKit.Color(180, 180, 180, 0.5),
    strokeWidth: 1,
  });

  const boundingRect = useMemo(
    () => getBoundingRect(page, state.selectedObjects),
    [page, state.selectedObjects],
  );

  const highlightedLayer = useMemo(() => {
    const highlightedLayer = state.highlightedLayer;

    if (
      !highlightedLayer ||
      // Don't draw a highlight when hovering over a selected layer on the canvas
      (state.selectedObjects.includes(highlightedLayer.id) &&
        highlightedLayer.precedence === 'belowSelection')
    ) {
      return;
    }

    const indexPath = findIndexPath(
      page,
      (layer) => layer.do_objectID === highlightedLayer.id,
    );

    if (!indexPath) return;

    const layer = Layers.access(page, indexPath);
    const layerTransform = AffineTransform.multiply(
      ...Layers.accessPath(page, indexPath)
        .slice(1, -1) // Remove the page and current layer
        .map((layer) =>
          AffineTransform.translation(layer.frame.x, layer.frame.y),
        ),
    );

    return (
      highlightedLayer && (
        <HighlightedLayerOutline layer={layer} transform={layerTransform} />
      )
    );
  }, [page, state]);

  return (
    <Group transform={transform}>
      {page.layers.map((layer) => (
        <SketchLayer key={layer.do_objectID} layer={layer} />
      ))}
      {boundingRect && (
        <BoundingRect rect={boundingRect} selectionPaint={selectionPaint} />
      )}
      {highlightedLayer}
      {boundingRect && (
        <DragHandles rect={boundingRect} selectionPaint={selectionPaint} />
      )}
      {state.interactionState.type === 'marquee' && (
        <Marquee interactionState={state.interactionState} />
      )}
      {state.interactionState.type === 'drawing' && (
        <SketchLayer
          key={state.interactionState.value.do_objectID}
          layer={state.interactionState.value}
        />
      )}
    </Group>
  );
});
