import { useApplicationState } from 'app/src/contexts/ApplicationStateContext';
import * as CanvasKit from 'canvaskit-wasm';
import { AffineTransform, createRect, insetRect } from 'noya-geometry';
import {
  Group,
  Polyline,
  Rect as RCKRect,
  useColorFill,
  usePaint,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { InteractionState, Layers, Rect } from 'noya-state';
import { findIndexPath } from 'noya-state/src/layers';
import {
  getBoundingPoints,
  getBoundingRect,
  getCanvasTransform,
  getCurrentPage,
  getLayerTransformAtIndexPath,
  getScreenTransform,
} from 'noya-state/src/selectors';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { getDragHandles } from '../canvas/selection';
import HoverOutline from './HoverOutline';
import SketchLayer from './layers/SketchLayer';
import { HorizontalRuler } from './Rulers';

const BoundingRect = memo(function BoundingRect({
  selectionPaint,
  rect,
}: {
  selectionPaint: CanvasKit.Paint;
  rect: Rect;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const alignedRect = useMemo(
    () => Primitives.rect(CanvasKit, insetRect(rect, 0.5, 0.5)),
    [CanvasKit, rect],
  );

  return <RCKRect rect={alignedRect} paint={selectionPaint} />;
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
            rect={Primitives.rect(CanvasKit, insetRect(handle.rect, 0.5, 0.5))}
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

  const rect = Primitives.rect(CanvasKit, createRect(origin, current));

  return (
    <>
      <RCKRect rect={rect} paint={stroke} />
      <RCKRect rect={rect} paint={fill} />
    </>
  );
});

export default memo(function SketchFileRenderer() {
  const [state] = useApplicationState();
  const { CanvasKit } = useReactCanvasKit();
  const page = getCurrentPage(state);
  const showRulers = state.preferences.showRulers;
  const screenTransform = getScreenTransform(state);
  const canvasTransform = getCanvasTransform(state);

  const canvasSize = state.canvasSize;
  const canvasInsets = state.canvasInsets;
  const canvasRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        canvasInsets.left,
        0,
        canvasSize.width,
        canvasSize.height,
      ),
    [CanvasKit, canvasInsets.left, canvasSize.height, canvasSize.width],
  );
  const backgroundColor = useTheme().colors.canvas.background;
  const backgroundFill = useColorFill(backgroundColor);

  const selectionPaint = usePaint({
    style: CanvasKit.PaintStyle.Stroke,
    color: CanvasKit.Color(180, 180, 180, 0.5),
    strokeWidth: 1,
  });

  const highlightPaint = usePaint({
    color: CanvasKit.Color(132, 63, 255, 1),
    style: CanvasKit.PaintStyle.Stroke,
    strokeWidth: 2,
  });

  const boundingRect = useMemo(
    () =>
      getBoundingRect(page, AffineTransform.identity, state.selectedObjects, {
        clickThroughGroups: true,
        includeHiddenLayers: true,
      }),
    [page, state.selectedObjects],
  );

  const boundingPoints = useMemo(
    () =>
      state.selectedObjects.map((id) =>
        getBoundingPoints(page, AffineTransform.identity, id, {
          clickThroughGroups: true,
          includeHiddenLayers: true,
        }),
      ),
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
    const layerTransform = getLayerTransformAtIndexPath(
      page,
      indexPath,
      AffineTransform.identity,
    );

    return (
      highlightedLayer && (
        <HoverOutline
          transform={layerTransform}
          layer={layer}
          paint={highlightPaint}
        />
      )
    );
  }, [highlightPaint, page, state.highlightedLayer, state.selectedObjects]);

  return (
    <>
      <RCKRect rect={canvasRect} paint={backgroundFill} />
      <Group transform={canvasTransform}>
        {page.layers.map((layer) => (
          <SketchLayer key={layer.do_objectID} layer={layer} />
        ))}
        {boundingRect && (
          <BoundingRect rect={boundingRect} selectionPaint={selectionPaint} />
        )}
        {boundingPoints.map((points, index) => (
          <Polyline key={index} points={points} paint={selectionPaint} />
        ))}
        {highlightedLayer}
        {boundingRect && (
          <DragHandles rect={boundingRect} selectionPaint={selectionPaint} />
        )}
        {state.interactionState.type === 'drawing' && (
          <SketchLayer
            key={state.interactionState.value.do_objectID}
            layer={state.interactionState.value}
          />
        )}
      </Group>
      <Group transform={screenTransform}>
        {state.interactionState.type === 'marquee' && (
          <Marquee interactionState={state.interactionState} />
        )}
        {showRulers && <HorizontalRuler />}
      </Group>
    </>
  );
});
