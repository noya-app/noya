import produce from 'immer';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { AffineTransform, createRect, insetRect, Rect } from 'noya-geometry';
import { useColorFill, useStroke } from 'noya-react-canvaskit';
import { Polyline, useCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import {
  createDrawingLayer,
  DecodedCurvePoint,
  defaultBorderColor,
  encodeCurvePoint,
  getClippedLayerMap,
  Layers,
  Primitives,
  Selectors,
} from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { ClippedLayerProvider } from '../ClippedLayerContext';
import { Group, Rect as RCKRect } from '../ComponentsContext';
import { ALL_DIRECTIONS, getGuides } from '../guides';
import { useRenderingMode } from '../RenderingModeContext';
import { useRootScale } from '../RootScaleContext';
import { useZoom, ZoomProvider } from '../ZoomContext';
import { DistanceMeasurementLabel } from './DistanceMeasurementLabel';
import DragHandles from './DragHandles';
import EditablePath from './EditablePath';
import GradientEditor from './GradientEditor';
import { ExtensionGuide, MeasurementGuide } from './Guides';
import HoverOutline from './HoverOutline';
import { InsertPointOverlay } from './InsertPointOverlay';
import { SketchArtboardContent } from './layers/SketchArtboard';
import SketchGroup from './layers/SketchGroup';
import SketchLayer from './layers/SketchLayer';
import Marquee from './Marquee';
import { PixelGrid } from './PixelGrid';
import PseudoPathLine from './PseudoPathLine';
import PseudoPoint from './PseudoPoint';
import { HorizontalRuler } from './Rulers';
import SnapGuides from './SnapGuides';

const BoundingRect = memo(function BoundingRect({ rect }: { rect: Rect }) {
  const {
    canvas: { dragHandleStroke },
  } = useTheme().colors;
  const zoom = useZoom();

  const strokeWidth = 1 / zoom;

  const paint = useStroke({
    color: dragHandleStroke,
    strokeWidth,
  });

  const CanvasKit = useCanvasKit();
  const alignedRect = useMemo(
    () =>
      Primitives.rect(
        CanvasKit,
        insetRect(rect, strokeWidth / 2, strokeWidth / 2),
      ),
    [CanvasKit, rect, strokeWidth],
  );

  return <RCKRect rect={alignedRect} paint={paint} />;
});

const RotatedBoundingRect = memo(function BoundingPoints({
  layerId,
}: {
  layerId: string;
}) {
  const [state] = useApplicationState();
  const {
    canvas: { dragHandleStroke },
  } = useTheme().colors;
  const zoom = useZoom();

  const paint = useStroke({
    color: dragHandleStroke,
    strokeWidth: 1 / zoom,
  });

  const page = Selectors.getCurrentPage(state);
  const boundingPoints = useMemo(
    () =>
      Selectors.getBoundingPoints(page, layerId, {
        groups: 'childrenOnly',
        includeHiddenLayers: true,
      }),
    [page, layerId],
  );

  return <Polyline points={boundingPoints} paint={paint} />;
});

export default memo(function SketchFileRenderer() {
  const {
    canvasSize,
    canvasInsets,
    preferences: { showRulers, showPixelGrid },
    highlightedLayer,
  } = useWorkspace();
  const [state] = useApplicationState();
  const interactionState = state.interactionState;
  const CanvasKit = useCanvasKit();
  const renderingMode = useRenderingMode();
  const page = Selectors.getCurrentPage(state);
  const screenTransform = Selectors.getScreenTransform(canvasInsets);
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const isEditingPath = Selectors.getIsEditingPath(interactionState.type);
  const isEditingText = Selectors.getIsEditingText(interactionState.type);
  const isInserting = interactionState.type === 'insert';
  const { zoomValue } = Selectors.getCurrentPageMetadata(state);
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
    canvas: { background: backgroundColor },
  } = useTheme().colors;
  const backgroundFill = useColorFill(backgroundColor);

  const boundingRect = useMemo(
    () =>
      Selectors.getBoundingRect(page, state.selectedLayerIds, {
        groups: 'childrenOnly',
        includeHiddenLayers: true,
      }),
    [page, state.selectedLayerIds],
  );

  const quickMeasureGuides = useMemo(() => {
    if (
      !highlightedLayer ||
      !highlightedLayer.isMeasured ||
      !boundingRect ||
      state.selectedLayerIds.length === 0 ||
      state.selectedLayerIds.includes(highlightedLayer.id)
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
      [highlightedLayer.id],
      {
        groups: 'childrenOnly',
        includeHiddenLayers: true,
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
  }, [highlightedLayer, page, state.selectedLayerIds, boundingRect]);

  const highlightedSketchLayer = useMemo(() => {
    if (
      !highlightedLayer ||
      // Don't draw a highlight when hovering over a selected layer on the canvas
      (state.selectedLayerIds.includes(highlightedLayer.id) &&
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
        <HoverOutline transform={layerTransform} layer={layer} />
      )
    );
  }, [highlightedLayer, page, state.selectedLayerIds]);

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

  const symbolToInsert = useMemo(() => {
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
          CanvasKit,
          interactionState.shapeType === 'oval' ||
            interactionState.shapeType === 'line'
            ? interactionState.shapeType
            : 'rectangle',
          SketchModel.style({
            borders: [
              SketchModel.border({
                color: defaultBorderColor,
                thickness: 1 / zoomValue,
              }),
            ],
          }),
          interactionState.origin,
          interactionState.current,
          true,
          {
            constrainProportions: state.keyModifiers.shiftKey,
            scalingOriginMode: state.keyModifiers.altKey ? 'center' : 'extent',
          },
          state.lastEditedTextStyle,
        )
      : undefined;

  const rootScale = useRootScale();
  const rootScaleTransform = useMemo(
    () => AffineTransform.scale(rootScale),
    [rootScale],
  );

  const clippedLayerMap = useMemo(() => {
    if (renderingMode === 'static') return {};

    return getClippedLayerMap(state, canvasSize, canvasInsets);
  }, [canvasInsets, canvasSize, renderingMode, state]);

  const gradient = state.selectedGradient
    ? Selectors.getSelectedGradient(page, state.selectedGradient)
    : undefined;

  return (
    <ClippedLayerProvider value={clippedLayerMap}>
      <ZoomProvider value={zoomValue}>
        <Group transform={rootScaleTransform}>
          <RCKRect rect={canvasRect} paint={backgroundFill} />
          <Group transform={canvasTransform}>
            <SketchGroup layer={page} />
          </Group>
          <Group transform={screenTransform}>
            {showPixelGrid && <PixelGrid />}
            {interactionState.type === 'marquee' && (
              <Marquee
                rect={createRect(
                  interactionState.origin,
                  interactionState.current,
                )}
              />
            )}
          </Group>
          <Group transform={canvasTransform}>
            {state.selectedGradient && gradient && (
              <GradientEditor
                gradient={gradient}
                selectedStopIndex={state.selectedGradient.stopIndex}
              />
            )}
            {symbolToInsert && <SketchArtboardContent layer={symbolToInsert} />}
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
                {(state.selectedLayerIds.length > 1 ||
                  !Selectors.getSelectedLineLayer(state)) &&
                  boundingRect &&
                  !state.selectedGradient &&
                  !drawingLayer &&
                  !isInserting && (
                    <>
                      <BoundingRect rect={boundingRect} />
                      {!isEditingText &&
                        state.selectedLayerIds.map((layerId) => (
                          <RotatedBoundingRect
                            key={layerId}
                            layerId={layerId}
                          />
                        ))}
                    </>
                  )}
                {!drawingLayer &&
                  !isInserting &&
                  !isEditingText &&
                  highlightedSketchLayer}
                {drawingLayer && <SketchLayer layer={drawingLayer} />}
                <SnapGuides />
                {quickMeasureGuides}
                {!state.selectedGradient &&
                  boundingRect &&
                  !drawingLayer &&
                  !isInserting &&
                  !isEditingText && <DragHandles rect={boundingRect} />}
              </>
            )}
          </Group>
          <Group transform={screenTransform}>
            {showRulers && <HorizontalRuler />}
          </Group>
        </Group>
      </ZoomProvider>
    </ClippedLayerProvider>
  );
});
