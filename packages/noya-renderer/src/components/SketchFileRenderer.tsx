import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit';
import { Path } from 'canvaskit';
import produce from 'immer';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import {
  AffineTransform,
  createRect,
  insetRect,
  Point,
  Rect,
} from 'noya-geometry';
import { useColorFill, useStroke } from 'noya-react-canvaskit';
import { Polyline, useCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import {
  createDrawingLayer,
  DecodedCurvePoint,
  defaultBorderColor,
  encodeCurvePoint,
  findMatchingSegmentPoints,
  getSelectedLayerIndexPathsExcludingDescendants,
  Layers,
  Primitives,
  Selectors,
} from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Group, Rect as RCKRect } from '../ComponentsContext';
import { ALL_DIRECTIONS, getGuides } from '../guides';
import DragHandles from './DragHandles';
import EditablePath from './EditablePath';
import { ExtensionGuide, MeasurementGuide } from './Guides';
import HoverOutline from './HoverOutline';
import { SketchArtboardContent } from './layers/SketchArtboard';
import SketchGroup from './layers/SketchGroup';
import SketchLayer from './layers/SketchLayer';
import Marquee from './Marquee';
import { MeasurementLabel } from './MeasurementLabel';
import PseudoPathLine from './PseudoPathLine';
import PseudoPoint from './PseudoPoint';
import { HorizontalRuler } from './Rulers';
import SnapGuides from './SnapGuides';

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
  const isInserting = interactionState.type === 'insert';
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

    const guides = ALL_DIRECTIONS.flatMap(([direction, axis]) => {
      const result = getGuides(
        direction,
        axis,
        boundingRect,
        highlightedBoundingRect,
      );

      return result ? [result] : [];
    });

    return (
      <>
        {guides.map((guide, index) => (
          <ExtensionGuide key={index} points={guide.extension} />
        ))}
        {guides.map((guide, index) => (
          <>
            <MeasurementGuide key={index} points={guide.measurement} />
            <MeasurementLabel key={index} points={guide.measurement} />
          </>
        ))}
      </>
    );
  }, [highlightedLayer, page, state.selectedObjects, boundingRect]);

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

  const maybeAddPointToPath = useMemo(() => {
    if (interactionState.type !== 'maybeAddPointToLine') return;

    const { point } = interactionState;
    const layerIndexPaths = getSelectedLayerIndexPathsExcludingDescendants(
      state,
    );

    //layerIndexPaths.forEach((layerIndex, index) => {
    const layer = Layers.access(page, layerIndexPaths[0]);

    if (!Layers.isPointsLayer(layer)) return;

    let segmentsArr: Sketch.CurvePoint[][] = [];
    layer.points.forEach(function (point, index) {
      const nextPoint = index === layer.points.length - 1 ? 0 : index + 1;
      const item = [point, layer.points[nextPoint]];
      segmentsArr.push(item);
    });

    let segmentPoints: Sketch.CurvePoint[] | undefined = undefined;
    let segmentPath: Path | undefined = undefined;

    for (let i = 0; i < segmentsArr.length; i++) {
      const segmentToAddPoint = findMatchingSegmentPoints(
        CanvasKit,
        layer,
        point,
        segmentsArr[i],
      );
      if (segmentToAddPoint) {
        segmentPoints = segmentToAddPoint.segmentPoints;
        segmentPath = segmentToAddPoint.segmentPath;
        break;
      }
    }
    //});
    return (
      <>
        {segmentPoints && layer.frame && (
          <>
            <PseudoPoint point={point} />
            <PseudoPathLine
              path={segmentPath}
              points={segmentPoints}
              frame={layer.frame}
            />
          </>
        )}
      </>
    );
  }, [CanvasKit, interactionState, page, state]);

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

  const drawingLayer =
    interactionState.type === 'drawing'
      ? createDrawingLayer(
          interactionState.shapeType === 'oval' ? 'oval' : 'rectangle',
          SketchModel.style({
            borders: [
              SketchModel.border({
                color: defaultBorderColor,
              }),
            ],
          }),
          createRect(interactionState.origin, interactionState.current),
        )
      : undefined;

  return (
    <>
      <RCKRect rect={canvasRect} paint={backgroundFill} />
      <Group transform={canvasTransform}>
        <SketchGroup layer={page} />
        {symbol && <SketchArtboardContent layer={symbol} />}
        {interactionState.type === 'drawingShapePath' ? (
          penToolPseudoElements
        ) : isEditingPath ? (
          <>
            {editablePaths}
            {editPathPseudoElements}
            {maybeAddPointToPath}
          </>
        ) : (
          <>
            {(state.selectedObjects.length > 1 ||
              !Selectors.getSelectedLineLayer(state)) &&
              boundingRect &&
              !drawingLayer &&
              !isInserting && (
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
            {!isEditingPath &&
              !drawingLayer &&
              !isInserting &&
              highlightedSketchLayer}
            {drawingLayer && <SketchLayer layer={drawingLayer} />}
            <SnapGuides />
            {quickMeasureGuides}
            {boundingRect && !drawingLayer && !isInserting && (
              <DragHandles
                rect={boundingRect}
                selectionPaint={selectionPaint}
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
