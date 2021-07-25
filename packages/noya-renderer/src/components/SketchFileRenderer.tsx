import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit';
import produce from 'immer';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import {
  AffineTransform,
  Axis,
  Bounds,
  createBounds,
  createRect,
  insetRect,
  Point,
} from 'noya-geometry';
import { useColorFill, useStroke } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import {
  DecodedCurvePoint,
  encodeCurvePoint,
  getAxisValues,
  getLayerAxisInfo,
  getPossibleSnapLayers,
  getSnappingPairs,
  Layers,
  Primitives,
  Rect,
  Selectors,
  SnappingPair,
} from 'noya-state';
import { groupBy } from 'noya-utils';
import React, { Fragment, memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Group, Rect as RCKRect } from '../ComponentsContext';
import AlignmentGuides from './AlignmentGuides';
import DragHandles from './DragHandles';
import EditablePath from './EditablePath';
import ExtensionGuide from './ExtensionGuide';
import {
  ALL_DIRECTIONS,
  getAxisProperties,
  getGuides,
  Guides,
  X_DIRECTIONS,
  Y_DIRECTIONS,
} from './guides';
import HoverOutline from './HoverOutline';
import { Polyline } from 'noya-renderer';
import { SketchArtboardContent } from './layers/SketchArtboard';
import SketchGroup from './layers/SketchGroup';
import SketchLayer from './layers/SketchLayer';
import Marquee from './Marquee';
import MeasurementGuide from './MeasurementGuide';
import PseudoPathLine from './PseudoPathLine';
import PseudoPoint from './PseudoPoint';
import { HorizontalRuler } from './Rulers';

const BoundingRect = memo(function BoundingRect({
  selectionPaint,
  rect,
}: {
  selectionPaint: CanvasKit.Paint;
  rect: Rect;
}) {
  const CanvasKit = useCanvasKit();
  const alignedRect = useMemo(
    () => Primitives.rect(CanvasKit, insetRect(rect, 0.5, 0.5)),
    [CanvasKit, rect],
  );

  return <>{<RCKRect rect={alignedRect} paint={selectionPaint} />}</>;
});

export default memo(function SketchFileRenderer() {
  const {
    canvasSize,
    canvasInsets,
    preferences: { showRulers },
    highlightedLayer,
  } = useWorkspace();
  const [state] = useApplicationState();
  const interactionState = state.interactionState;
  const CanvasKit = useCanvasKit();
  const page = Selectors.getCurrentPage(state);
  const screenTransform = Selectors.getScreenTransform(canvasInsets);
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const isEditingPath = Selectors.getIsEditingPath(interactionState.type);

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
  const {
    canvas: { background: backgroundColor, dragHandleStroke },
  } = useTheme().colors;
  const backgroundFill = useColorFill(backgroundColor);

  const selectionPaint = useStroke({
    color: dragHandleStroke,
  });

  const highlightPaint = useStroke({
    color: CanvasKit.Color(132, 63, 255, 1),
    strokeWidth: 2,
  });

  const boundingRect = useMemo(
    () =>
      Selectors.getBoundingRect(
        page,
        AffineTransform.identity,
        state.selectedObjects,
        {
          clickThroughGroups: true,
          includeHiddenLayers: true,
          includeArtboardLayers: false,
        },
      ),
    [page, state.selectedObjects],
  );

  const boundingPoints = useMemo(
    () =>
      state.selectedObjects.map((id: string) =>
        Selectors.getBoundingPoints(page, AffineTransform.identity, id, {
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

    const indexPath = Layers.findIndexPath(
      page,
      (layer) => layer.do_objectID === highlightedLayer.id,
    );

    if (!indexPath) return;

    const highlightedBoundingRect = Selectors.getBoundingRect(
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
    if (interactionState.type !== 'moving' || !boundingRect) return;

    const layerIndexPaths = Selectors.getSelectedLayerIndexPathsExcludingDescendants(
      state,
    );

    const possibleSnapLayers = getPossibleSnapLayers(
      state,
      layerIndexPaths,
      interactionState.canvasSize,
    )
      // Ensure we don't snap to the selected layer itself
      .filter((layer) => !state.selectedObjects.includes(layer.do_objectID));

    const snappingLayerInfos = getLayerAxisInfo(page, possibleSnapLayers);

    const selectedBounds = createBounds(boundingRect);

    const xPairs = getSnappingPairs(
      getAxisValues(boundingRect, 'x'),
      snappingLayerInfos,
      'x',
    ).filter((pair) => pair.selectedLayerValue === pair.visibleLayerValue);

    const yPairs = getSnappingPairs(
      getAxisValues(boundingRect, 'y'),
      snappingLayerInfos,
      'y',
    ).filter((pair) => pair.selectedLayerValue === pair.visibleLayerValue);

    const axisSnappingPairs: [Axis, SnappingPair[]][] = [
      ['x', xPairs],
      ['y', yPairs],
    ];

    const layerBoundsMap: Record<string, Bounds> = {};

    [...xPairs, ...yPairs]
      .map((pair) => pair.visibleLayerId)
      .forEach((layerId) => {
        if (layerId in layerBoundsMap) return;

        const layerToSnapBoundingRect = Selectors.getBoundingRect(
          page,
          AffineTransform.identity,
          [layerId],
          {
            clickThroughGroups: true,
            includeHiddenLayers: false,
            includeArtboardLayers: false,
          },
        );

        if (!layerToSnapBoundingRect) return;

        layerBoundsMap[layerId] = createBounds(layerToSnapBoundingRect);
      });

    const nearestLayerGuides = axisSnappingPairs.map(
      ([axis, snappingPairs]) => {
        const getMinGuideDistance = (guides: Guides[]) =>
          Math.min(
            ...guides.map((guide) => guide.distanceMeasurement.distance),
          );

        const guides = snappingPairs
          .map((pair) => {
            const visibleLayerBounds = layerBoundsMap[pair.visibleLayerId];

            const directions = axis === 'y' ? X_DIRECTIONS : Y_DIRECTIONS;

            return directions.flatMap(([direction, axis]) => {
              const result = getGuides(
                direction,
                axis,
                selectedBounds,
                visibleLayerBounds,
              );

              return result ? [result] : [];
            });
          })
          .sort((a, b) => getMinGuideDistance(a) - getMinGuideDistance(b));

        return guides.length > 0 ? guides[0] : undefined;
      },
    );

    const alignmentGuides = axisSnappingPairs.flatMap(
      ([axis, snappingPairs]) => {
        const groupedPairs = groupBy(
          snappingPairs,
          (value) => value.selectedLayerValue,
        );

        return Object.values(groupedPairs).map((pairs): Point[] => {
          const visibleLayerBounds = pairs.map(
            ({ visibleLayerId }) => layerBoundsMap[visibleLayerId],
          );

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
      },
    );

    return (
      <>
        <AlignmentGuides lines={alignmentGuides} />
        {nearestLayerGuides.map(
          (guides, i) =>
            guides && (
              <Fragment key={i}>
                {guides.map((guide, j) => (
                  <ExtensionGuide
                    key={`extension-${i}-${j}`}
                    points={guide.extension}
                  />
                ))}
                {guides.map((guide, j) => (
                  <MeasurementGuide
                    key={`measurement-${i}-${j}`}
                    distanceMeasurement={guide.distanceMeasurement!}
                    measurement={guide.measurement}
                  />
                ))}
              </Fragment>
            ),
        )}
      </>
    );
  }, [interactionState, boundingRect, state, page]);

  const highlightedSketchLayer = useMemo(() => {
    if (
      !highlightedLayer ||
      // Don't draw a highlight when hovering over a selected layer on the canvas
      (state.selectedObjects.includes(highlightedLayer.id) &&
        highlightedLayer.precedence === 'belowSelection')
    ) {
      return;
    }

    const indexPath = Layers.findIndexPath(
      page,
      (layer) => layer.do_objectID === highlightedLayer.id,
    );

    if (!indexPath) return;

    const layer = Layers.access(page, indexPath);
    const layerTransform = Selectors.getLayerTransformAtIndexPath(
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

  const penToolPseudoElements = useMemo(() => {
    if (interactionState.type !== 'drawingShapePath' || !interactionState.point)
      return;

    return <PseudoPoint point={interactionState.point} />;
  }, [interactionState]);

  // The `useMemo` is just for organization here, since we have `state` in the deps
  const editPathPseudoElements = useMemo(() => {
    const indexPath = Selectors.getIndexPathOfOpenShapeLayer(state);

    if (
      !indexPath ||
      interactionState.type !== 'editPath' ||
      !interactionState.point ||
      Selectors.getPathElementAtPoint(state, interactionState.point)
    )
      return;

    const layer = Layers.access(
      page,
      indexPath.indexPath,
    ) as Layers.PointsLayer;

    const decodedPointToDraw: DecodedCurvePoint = {
      _class: 'curvePoint',
      cornerRadius: 0,
      curveFrom: interactionState.point,
      curveTo: interactionState.point,
      hasCurveFrom: false,
      hasCurveTo: false,
      curveMode: Sketch.CurveMode.Straight,
      point: interactionState.point,
    };

    const encodedPointToDraw = encodeCurvePoint(
      decodedPointToDraw,
      layer.frame,
    );
    const points = [encodedPointToDraw, layer.points[indexPath.pointIndex]];

    return (
      <>
        <PseudoPathLine points={points} frame={layer.frame} />
        <PseudoPoint point={interactionState.point} />
      </>
    );
  }, [interactionState, page, state]);

  const editablePaths = useMemo(() => {
    if (!isEditingPath) return;
    const selectedLayerIndexPaths = Selectors.getSelectedLayerIndexPaths(state);

    return (
      <>
        {selectedLayerIndexPaths.map((indexPath, index) => {
          const layer = Layers.access(page, indexPath);

          if (!Layers.isPointsLayer(layer)) return null;

          const layerTransform = Selectors.getLayerTransformAtIndexPath(
            page,
            indexPath,
          );

          return (
            <EditablePath
              key={layer.do_objectID}
              transform={layerTransform}
              layer={layer}
              selectedIndexes={
                state.selectedPointLists[layer.do_objectID] ?? []
              }
              selectedControlPoint={
                state.selectedControlPoint
                  ? state.selectedControlPoint
                  : undefined
              }
            />
          );
        })}
      </>
    );
  }, [isEditingPath, page, state]);

  const symbol = useMemo(() => {
    if (interactionState.type !== 'insertingSymbol') return;

    const point = interactionState.point;
    if (!point) return;

    const symbol = {
      ...Selectors.getSymbols(state).find(
        ({ do_objectID }) => do_objectID === interactionState.symbolID,
      ),
    } as Sketch.SymbolMaster;

    const symbolInstance = produce(symbol, (draft) => {
      if (!symbol || !draft.style) return;

      draft.style.contextSettings = {
        _class: 'graphicsContextSettings',
        blendMode: 1,
        opacity: 0.5,
      };

      draft.frame = {
        ...symbol.frame,
        x: point.x - symbol.frame.width / 2,
        y: point.y - symbol.frame.height / 2,
      };
    });

    return symbolInstance;
  }, [state, interactionState]);

  return (
    <>
      <RCKRect rect={canvasRect} paint={backgroundFill} />
      <Group transform={canvasTransform}>
        <SketchGroup layer={page} />
        {symbol && (
          <SketchArtboardContent layer={symbol} showBackground={false} />
        )}
        {interactionState.type === 'drawingShapePath' ? (
          penToolPseudoElements
        ) : isEditingPath ? (
          <>
            {editablePaths}
            {editPathPseudoElements}
          </>
        ) : (
          <>
            {(state.selectedObjects.length > 1 ||
              !Selectors.getSelectedLineLayer(state)) &&
              boundingRect && (
                <>
                  <BoundingRect
                    rect={boundingRect}
                    selectionPaint={selectionPaint}
                  />
                  {boundingPoints.map((points: Point[], index: number) => (
                    <Polyline
                      key={index}
                      points={points}
                      paint={selectionPaint}
                    />
                  ))}
                </>
              )}
            {!isEditingPath && highlightedSketchLayer}
            {smartSnapGuides}
            {quickMeasureGuides}
            {boundingRect && (
              <DragHandles
                rect={boundingRect}
                selectionPaint={selectionPaint}
              />
            )}
            {interactionState.type === 'drawing' && (
              <SketchLayer
                key={interactionState.value.do_objectID}
                layer={interactionState.value}
              />
            )}
          </>
        )}
      </Group>
      <Group transform={screenTransform}>
        {interactionState.type === 'marquee' && (
          <Marquee
            rect={createRect(interactionState.origin, interactionState.current)}
          />
        )}
        {showRulers && <HorizontalRuler />}
      </Group>
    </>
  );
});
