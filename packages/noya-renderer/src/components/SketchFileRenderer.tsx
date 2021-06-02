import { useApplicationState } from 'app/src/contexts/ApplicationStateContext';
import { useWorkspace } from 'app/src/hooks/useWorkspace';
import * as CanvasKit from 'canvaskit-wasm';
import {
  AffineTransform,
  createBounds,
  createRect,
  insetRect,
} from 'noya-geometry';
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
} from 'noya-state/src/selectors/selectors';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { getDragHandles } from '../canvas/selection';
import DistanceLabelAndPath from './DistanceLabelAndPath';
import { ALL_DIRECTIONS, getGuides } from './guides';
import HoverOutline from './HoverOutline';
import SketchGroup from './layers/SketchGroup';
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
  const {
    canvasSize,
    canvasInsets,
    preferences: { showRulers },
    highlightedLayer,
  } = useWorkspace();
  const [state] = useApplicationState();
  const { CanvasKit } = useReactCanvasKit();
  const page = getCurrentPage(state);
  const screenTransform = getScreenTransform(canvasInsets);
  const canvasTransform = getCanvasTransform(state, canvasInsets);

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

  const distanceLabelAndPathBetweenSketchLayers = useMemo(() => {
    if (
      !highlightedLayer ||
      !highlightedLayer.isMeasured ||
      !boundingRect ||
      state.selectedObjects.length === 0 ||
      state.selectedObjects.includes(highlightedLayer.id)
    ) {
      return;
    }

    const indexPath = findIndexPath(
      page,
      (layer) => layer.do_objectID === highlightedLayer.id,
    );

    if (!indexPath) return;

    const highlightedBoundingRect = getBoundingRect(
      page,
      AffineTransform.identity,
      [highlightedLayer.id],
      {
        clickThroughGroups: true,
        includeHiddenLayers: true,
      },
    );

    if (!highlightedBoundingRect) {
      return;
    }

    const highlightedBounds = createBounds(highlightedBoundingRect);
    const selectedBounds = createBounds(boundingRect);
    const axes = ['x', 'y'];

    const guides = ALL_DIRECTIONS.filter(([, axis]) =>
      axes.includes(axis),
    ).flatMap(([direction, axis]) => {
      const result = getGuides(
        direction,
        axis,
        selectedBounds,
        highlightedBounds,
      );

      return result ? [result] : [];
    });

    return highlightedBoundingRect && <DistanceLabelAndPath guides={guides} />;
  }, [highlightedLayer, page, state.selectedObjects, boundingRect]);

  type SmartSnapObj = {
    closestLayerId: string;
    setSelectedBounds: number;
    setVisibleBounds: number;
    guides: any[];
  };

  const smartSnapGuidesX = useMemo(() => {
    if (
      state.interactionState.type !== 'moving' ||
      !boundingRect ||
      !state.canvasVisibleAndSelectedLayerAxisPairs ||
      !state.interactionState.current.y
    ) {
      return;
    }

    let matches: SmartSnapObj[] = [];

    state.canvasVisibleAndSelectedLayerAxisPairs.xBounds.forEach(function (
      pair,
    ) {
      const distance = Math.abs(
        pair.selectedLayerValue - pair.visibleLayerValue,
      );

      if (distance > 6) return;

      const snapDistance = pair.selectedLayerValue - pair.visibleLayerValue;

      const match: SmartSnapObj = {
        closestLayerId: pair.visibleLayerId,
        setSelectedBounds: pair.selectedLayerValue - snapDistance,
        setVisibleBounds: pair.visibleLayerValue,
        guides: [],
      };
      matches.push(match);
    });

    const selectedBounds = createBounds(boundingRect);
    const axes = ['y'];

    matches.forEach((match) => {
      const layerToSnapBoundingRect = getBoundingRect(
        page,
        AffineTransform.identity,
        [match.closestLayerId],
        {
          clickThroughGroups: true,
          includeHiddenLayers: true,
        },
      );
      if (!layerToSnapBoundingRect) {
        return [];
      }

      const highlightedBounds = createBounds(layerToSnapBoundingRect);

      match.guides = ALL_DIRECTIONS.filter(([, axis]) =>
        axes.includes(axis),
      ).flatMap(([direction, axis]) => {
        const result = getGuides(
          direction,
          axis,
          selectedBounds,
          highlightedBounds,
          match.setSelectedBounds,
        );

        return result ? [result] : [];
      });
    });

    return (
      <>
        {matches.map((match, index) => {
          return (
            <DistanceLabelAndPath
              guides={match.guides}
              showSnap={true}
              key={index}
            />
          );
        })}
      </>
    );
  }, [
    page,
    boundingRect,
    state.interactionState,
    state.canvasVisibleAndSelectedLayerAxisPairs,
  ]);

  const smartSnapGuidesY = useMemo(() => {
    if (
      state.interactionState.type !== 'moving' ||
      !boundingRect ||
      !state.canvasVisibleAndSelectedLayerAxisPairs ||
      !state.interactionState.current.y
    ) {
      return;
    }

    let matches: SmartSnapObj[] = [];

    state.canvasVisibleAndSelectedLayerAxisPairs.yBounds.forEach(function (
      pair,
    ) {
      const distance = Math.abs(
        pair.selectedLayerValue - pair.visibleLayerValue,
      );

      if (distance > 6) return;

      const snapDistance = pair.selectedLayerValue - pair.visibleLayerValue;

      const match: SmartSnapObj = {
        closestLayerId: pair.visibleLayerId,
        setSelectedBounds: pair.selectedLayerValue - snapDistance,
        setVisibleBounds: pair.visibleLayerValue,
        guides: [],
      };
      matches.push(match);
    });

    const selectedBounds = createBounds(boundingRect);
    const axes = ['x'];

    matches.forEach((match) => {
      const layerToSnapBoundingRect = getBoundingRect(
        page,
        AffineTransform.identity,
        [match.closestLayerId],
        {
          clickThroughGroups: true,
          includeHiddenLayers: true,
        },
      );
      if (!layerToSnapBoundingRect) {
        return [];
      }

      const highlightedBounds = createBounds(layerToSnapBoundingRect);

      match.guides = ALL_DIRECTIONS.filter(([, axis]) =>
        axes.includes(axis),
      ).flatMap(([direction, axis]) => {
        const result = getGuides(
          direction,
          axis,
          selectedBounds,
          highlightedBounds,
          match.setSelectedBounds,
        );

        return result ? [result] : [];
      });
    });
    return (
      <>
        {matches.map((match, index) => {
          return (
            <DistanceLabelAndPath
              guides={match.guides}
              showSnap={true}
              key={index}
            />
          );
        })}
      </>
    );
  }, [
    page,
    boundingRect,
    state.interactionState,
    state.canvasVisibleAndSelectedLayerAxisPairs,
  ]);

  const highlightedSketchLayer = useMemo(() => {
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
  }, [highlightPaint, highlightedLayer, page, state.selectedObjects]);

  return (
    <>
      <RCKRect rect={canvasRect} paint={backgroundFill} />
      <Group transform={canvasTransform}>
        <SketchGroup layer={page} />
        {boundingRect && (
          <BoundingRect rect={boundingRect} selectionPaint={selectionPaint} />
        )}
        {boundingPoints.map((points, index) => (
          <Polyline key={index} points={points} paint={selectionPaint} />
        ))}
        {highlightedSketchLayer}
        {smartSnapGuidesX}
        {smartSnapGuidesY}
        {distanceLabelAndPathBetweenSketchLayers}
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
