import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit';
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
  Layers,
  Primitives,
  Selectors,
} from 'noya-state';
import React, { Fragment, memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Group, Path, Rect as RCKRect } from '../ComponentsContext';
import { ALL_DIRECTIONS, getGuides } from '../guides';
import { DistanceMeasurementLabel } from './DistanceMeasurementLabel';
import DragHandles from './DragHandles';
import EditablePath from './EditablePath';
import { ExtensionGuide, MeasurementGuide } from './Guides';
import HoverOutline from './HoverOutline';
import { InsertPointOverlay } from './InsertPointOverlay';
import { SketchArtboardContent } from './layers/SketchArtboard';
import SketchGroup from './layers/SketchGroup';
import SketchLayer from './layers/SketchLayer';
import Marquee from './Marquee';
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
  const isEditingText = Selectors.getIsEditingText(interactionState.type);
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
            <DistanceMeasurementLabel key={index} points={guide.measurement} />
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

  const gradientLineStroke = useStroke({ color: '#FFF' });
  const gradientStopStroke = useStroke({ color: '#FFF', strokeWidth: 1.5 });
  const gradientEditorShadow = useMemo(
    () =>
      CanvasKit.ImageFilter.MakeDropShadowOnly(
        0,
        0,
        2,
        2,
        CanvasKit.Color(0, 0, 0, 0.5),
        null,
      ),

    [CanvasKit],
  );

  const gradientPoints = useMemo(() => {
    const gradientStopPoints = Selectors.getSelectedGradientStopPoints(state);

    if (!gradientStopPoints || !state.selectedGradient) return null;

    const { stopIndex } = state.selectedGradient;

    return (
      <Group imageFilter={gradientEditorShadow}>
        <Polyline
          points={[
            gradientStopPoints[0].point,
            gradientStopPoints[gradientStopPoints.length - 1].point,
          ]}
          paint={gradientLineStroke}
        />
        {gradientStopPoints.map(({ point, color }, index) => {
          const path = new CanvasKit.Path();

          const radius =
            index === stopIndex
              ? Selectors.POINT_RADIUS * 1.5
              : Selectors.POINT_RADIUS;

          path.addOval(
            CanvasKit.XYWHRect(
              point.x - radius,
              point.y - radius,
              radius * 2,
              radius * 2,
            ),
          );

          const paint = new CanvasKit.Paint();
          paint.setColor(Primitives.color(CanvasKit, color));

          return (
            <Fragment key={index}>
              <Path path={path} paint={paint} />
              <Path path={path} paint={gradientStopStroke} />
            </Fragment>
          );
        })}
      </Group>
    );
  }, [
    state,
    gradientEditorShadow,
    gradientLineStroke,
    CanvasKit,
    gradientStopStroke,
  ]);

  const drawingLayer =
    interactionState.type === 'drawing'
      ? createDrawingLayer(
          interactionState.shapeType === 'oval' ||
            interactionState.shapeType === 'line'
            ? interactionState.shapeType
            : 'rectangle',
          SketchModel.style({
            borders: [
              SketchModel.border({
                color: defaultBorderColor,
              }),
            ],
          }),
          interactionState.origin,
          interactionState.current,
          true,
        )
      : undefined;

  return (
    <>
      <RCKRect rect={canvasRect} paint={backgroundFill} />
      <Group transform={canvasTransform}>
        <SketchGroup layer={page} />
        {gradientPoints}
        {symbol && <SketchArtboardContent layer={symbol} />}
        {interactionState.type === 'drawingShapePath' ? (
          penToolPseudoElements
        ) : isEditingPath ? (
          <>
            {editablePaths}
            {editPathPseudoElements}
            <InsertPointOverlay />
          </>
        ) : (
          <>
            {(state.selectedObjects.length > 1 ||
              !Selectors.getSelectedLineLayer(state)) &&
              boundingRect &&
              !gradientPoints &&
              !drawingLayer &&
              !isInserting && (
                <>
                  <BoundingRect
                    rect={boundingRect}
                    selectionPaint={selectionPaint}
                  />
                  {!isEditingText &&
                    boundingPoints.map((points: Point[], index: number) => (
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
              !isEditingText &&
              highlightedSketchLayer}
            {drawingLayer && <SketchLayer layer={drawingLayer} />}
            <SnapGuides />
            {quickMeasureGuides}
            {!gradientPoints &&
              boundingRect &&
              !drawingLayer &&
              !isInserting &&
              !isEditingText && (
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
