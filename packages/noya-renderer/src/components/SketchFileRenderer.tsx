import { useApplicationState } from 'app/src/contexts/ApplicationStateContext';
import { useWorkspace } from 'app/src/hooks/useWorkspace';
import * as CanvasKit from 'canvaskit';
import {
  AffineTransform,
  createBounds,
  createRect,
  insetRect,
  Point,
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
  getSelectedLayerIndexPathsExcludingDescendants,
} from 'noya-state/src/selectors/selectors';
import {
  getAxisValues,
  getLayerAxisPairs,
  getPossibleSnapLayers,
  getSnappingPairs,
  SnappingPair,
} from 'noya-state/src/snapping';
import { groupBy } from 'noya-utils';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { getDragHandles } from '../canvas/selection';
import AlignmentGuides from './AlignmentGuides';
import ExtensionGuide from './ExtensionGuide';
import {
  ALL_DIRECTIONS,
  Axis,
  getAxisProperties,
  getGuides,
  X_DIRECTIONS,
  Y_DIRECTIONS,
} from './guides';
import HoverOutline from './HoverOutline';
import SketchGroup from './layers/SketchGroup';
import SketchLayer from './layers/SketchLayer';
import MeasurementGuide from './MeasurementGuide';
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
        includeArtboardLayers: false,
      }),
    [page, state.selectedObjects],
  );

  const boundingPoints = useMemo(
    () =>
      state.selectedObjects.map((id) =>
        getBoundingPoints(page, AffineTransform.identity, id, {
          clickThroughGroups: true,
          includeHiddenLayers: true,
          includeArtboardLayers: false,
        }),
      ),
    [page, state.selectedObjects],
  );

  const quickMeasureGuides = useMemo(() => {
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
        includeArtboardLayers: false,
      },
    );

    if (!highlightedBoundingRect) return;

    const highlightedBounds = createBounds(highlightedBoundingRect);
    const selectedBounds = createBounds(boundingRect);

    const guides = ALL_DIRECTIONS.flatMap(([direction, axis]) => {
      const result = getGuides(
        direction,
        axis,
        selectedBounds,
        highlightedBounds,
      );

      return result ? [result] : [];
    });

    return (
      <>
        {guides.map((guide, index) => (
          <ExtensionGuide key={index} points={guide.extension} />
        ))}
        {guides.map((guide, index) => (
          <MeasurementGuide
            key={index}
            distanceMeasurement={guide.distanceMeasurement!}
            measurement={guide.measurement}
          />
        ))}
      </>
    );
  }, [highlightedLayer, page, state.selectedObjects, boundingRect]);

  const smartSnapGuides = useMemo(() => {
    if (state.interactionState.type !== 'moving' || !boundingRect) return;

    const layerIndexPaths = getSelectedLayerIndexPathsExcludingDescendants(
      state,
    );

    const possibleSnapLayers = getPossibleSnapLayers(
      layerIndexPaths,
      state,
      state.interactionState,
    )
      // Ensure we don't snap to the selected layer itself
      .filter((layer) => !state.selectedObjects.includes(layer.do_objectID));

    const snappingLayerInfos = getLayerAxisPairs(page, possibleSnapLayers);

    const bounds = createBounds(boundingRect);
    const selectedBounds = createBounds(boundingRect);

    const xPairs = getSnappingPairs(
      getAxisValues(bounds, 'x'),
      snappingLayerInfos,
      'x',
    );

    const yPairs = getSnappingPairs(
      getAxisValues(bounds, 'y'),
      snappingLayerInfos,
      'y',
    );

    const possibleGuides: [Axis, SnappingPair[]][] = [
      ['x', xPairs],
      ['y', yPairs],
    ];

    const distances = possibleGuides.map(([axis, snappingPairs]) => {
      return snappingPairs
        .filter((pair) => pair.selectedLayerValue === pair.visibleLayerValue)
        .flatMap((pair) => {
          const layerToSnapBoundingRect = getBoundingRect(
            page,
            AffineTransform.identity,
            [pair.visibleLayerId],
            {
              clickThroughGroups: true,
              includeHiddenLayers: false,
              includeArtboardLayers: false,
            },
          );

          if (!layerToSnapBoundingRect) return [];

          const highlightedBounds = createBounds(layerToSnapBoundingRect);

          const directions = axis === 'y' ? X_DIRECTIONS : Y_DIRECTIONS;

          const guides = directions.flatMap(([direction, axis]) => {
            const result = getGuides(
              direction,
              axis,
              selectedBounds,
              highlightedBounds,
            );

            return result ? [result] : [];
          });

          return [
            {
              pair,
              guides,
              distance: guides.map(
                (guide) => guide.distanceMeasurement.distance,
              )[0],
            },
          ];
        })
        .sort((a, b) => a.distance - b.distance);
    });

    const alignmentGuides = possibleGuides.flatMap(([axis, snappingPairs]) => {
      const groupedPairs: Record<number, SnappingPair[]> = groupBy(
        snappingPairs.filter(
          (pair) => pair.selectedLayerValue === pair.visibleLayerValue,
        ),
        (value) => value.selectedLayerValue,
      );

      const matches: Point[][] = Object.values(groupedPairs).map((pairs) => {
        const visibleLayerBounds = pairs.flatMap(({ visibleLayerId }) => {
          const rect = getBoundingRect(
            page,
            AffineTransform.identity,
            [visibleLayerId],
            {
              clickThroughGroups: true,
              includeHiddenLayers: false,
              includeArtboardLayers: false,
            },
          );

          if (!rect) return [];

          return createBounds(rect);
        });

        const m = axis;
        const c = axis === 'x' ? 'y' : 'x';

        const [minC, , maxC] = getAxisProperties(c, '+');

        return [
          {
            [m]: pairs[0].visibleLayerValue,
            [c]: Math.min(
              selectedBounds[minC],
              ...visibleLayerBounds.map((bounds) => bounds[minC]),
            ),
          } as Point,
          {
            [m]: pairs[0].visibleLayerValue,
            [c]: Math.max(
              selectedBounds[maxC],
              ...visibleLayerBounds.map((bounds) => bounds[maxC]),
            ),
          } as Point,
        ];
      });

      return matches;
    });

    return (
      <>
        {distances.map(
          (distance) =>
            distance.length > 0 && (
              <>
                {distance[0].guides.map((guide, index) => (
                  <ExtensionGuide key={index} points={guide.extension} />
                ))}
                {distance[0].guides.map((guide, index) => (
                  <MeasurementGuide
                    key={index}
                    distanceMeasurement={guide.distanceMeasurement!}
                    measurement={guide.measurement}
                  />
                ))}
              </>
            ),
        )}
        <AlignmentGuides lines={alignmentGuides} />
      </>
    );
  }, [state, boundingRect, page]);

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
        {smartSnapGuides}
        {quickMeasureGuides}
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
