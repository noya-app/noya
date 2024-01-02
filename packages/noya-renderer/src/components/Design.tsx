import { Sketch } from '@noya-app/noya-file-format';
import {
  createBounds,
  createRect,
  transformRect,
} from '@noya-app/noya-geometry';
import produce from 'immer';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { useColorFill } from 'noya-react-canvaskit';
import { SketchModel } from 'noya-sketch-model';
import {
  DecodedCurvePoint,
  Layers,
  Primitives,
  Selectors,
  createDrawingLayer,
  defaultBorderColor,
  encodeCurvePoint,
  getClippedLayerMap,
  getScalingOptions,
} from 'noya-state';
import React, { ReactNode, memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { ClippedLayerProvider } from '../ClippedLayerContext';
import { Group, Rect as RCKRect } from '../ComponentsContext';
import { useRenderingMode } from '../RenderingModeContext';
import { ZoomProvider } from '../ZoomContext';
import { ALL_DIRECTIONS, getGuides } from '../guides';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { useCanvasRect } from '../hooks/useCanvasRect';
import { useRootScaleTransform } from '../hooks/useRootScaleTransform';
import { pixelAlignRect } from '../pixelAlignment';
import { BoundingRect } from './BoundingRect';
import { DistanceMeasurementLabel } from './DistanceMeasurementLabel';
import DragHandles from './DragHandles';
import EditablePath from './EditablePath';
import { FloatingBubbleLabel } from './FloatingBubbleLabel';
import GradientEditor from './GradientEditor';
import { ExtensionGuide, MeasurementGuide } from './Guides';
import HoverOutline from './HoverOutline';
import { InsertPointOverlay } from './InsertPointOverlay';
import Marquee from './Marquee';
import { PixelGrid } from './PixelGrid';
import PseudoPathLine from './PseudoPathLine';
import PseudoPoint from './PseudoPoint';
import { RotatedBoundingRect } from './RotatedBoundingRect';
import { HorizontalRuler } from './Rulers';
import SnapGuides from './SnapGuides';
import { SketchArtboardContent } from './layers/SketchArtboard';
import SketchLayer from './layers/SketchLayer';

const DesignBackground = memo(function DesignBackground() {
  const backgroundColor = useTheme().colors.canvas.background;
  const canvasRect = useCanvasRect();
  const backgroundFill = useColorFill(backgroundColor);

  return <RCKRect rect={canvasRect} paint={backgroundFill} />;
});

const DesignPage = memo(function DesignPage() {
  const { canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const page = Selectors.getCurrentPage(state);

  return (
    <Group transform={canvasTransform}>
      <SketchLayer layer={page} />
    </Group>
  );
});

const DesignPixelGrid = memo(function DesignPixelGrid() {
  const {
    canvasInsets,
    preferences: { showPixelGrid },
  } = useWorkspace();
  const screenTransform = Selectors.getScreenTransform(canvasInsets);

  if (!showPixelGrid) return <></>;

  return (
    <Group transform={screenTransform}>
      <PixelGrid />
    </Group>
  );
});

const DesignMarquee = memo(function DesignMarquee() {
  const { canvasInsets } = useWorkspace();
  const screenTransform = Selectors.getScreenTransform(canvasInsets);
  const [state] = useApplicationState();
  const interactionState = state.interactionState;

  if (interactionState.type !== 'marquee') return <></>;

  return (
    <Group transform={screenTransform}>
      <Marquee
        rect={createRect(interactionState.origin, interactionState.current)}
      />
    </Group>
  );
});

const DesignRulers = memo(function DesignRulers() {
  const {
    canvasInsets,
    preferences: { showRulers },
  } = useWorkspace();
  const screenTransform = Selectors.getScreenTransform(canvasInsets);

  if (!showRulers) return <></>;

  return (
    <Group transform={screenTransform}>
      <HorizontalRuler />
    </Group>
  );
});

const DesignGradientEditor = memo(function DesignGradientEditor() {
  const { canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const page = Selectors.getCurrentPage(state);
  const gradient = state.selectedGradient
    ? Selectors.getSelectedGradient(page, state.selectedGradient)
    : undefined;
  const renderingMode = useRenderingMode();

  if (renderingMode !== 'interactive' || !state.selectedGradient || !gradient) {
    return <></>;
  }

  return (
    <Group transform={canvasTransform}>
      <GradientEditor
        gradient={gradient}
        selectedStopIndex={state.selectedGradient.stopIndex}
      />
    </Group>
  );
});

const DesignInsertSymbol = memo(function DesignInsertSymbol() {
  const { canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const renderingMode = useRenderingMode();
  const interactionState = state.interactionState;

  const symbolToInsert = useMemo(() => {
    if (interactionState.type !== 'insertingSymbol') return;

    const point = interactionState.point;

    if (!point) return;

    const symbol = {
      ...Selectors.getSymbolMaster(state, interactionState.symbolID),
    };

    const symbolInstance = produce(symbol, (draft) => {
      if (!symbol || !draft.style) return;

      draft.style.contextSettings = SketchModel.graphicsContextSettings({
        opacity: 0.5,
      });

      draft.frame = {
        ...symbol.frame,
        x: point.x - symbol.frame.width / 2,
        y: point.y - symbol.frame.height / 2,
      };
    });

    return symbolInstance;
  }, [state, interactionState]);

  if (renderingMode !== 'interactive' || !symbolToInsert) {
    return <></>;
  }

  return (
    <Group transform={canvasTransform}>
      <SketchArtboardContent SketchLayer={SketchLayer} layer={symbolToInsert} />
    </Group>
  );
});

const DesignDrawPath = memo(function DesignDrawPath() {
  const { canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const renderingMode = useRenderingMode();
  const interactionState = state.interactionState;

  if (
    renderingMode !== 'interactive' ||
    interactionState.type !== 'drawingShapePath' ||
    !interactionState.point
  ) {
    return <></>;
  }

  return (
    <Group transform={canvasTransform}>
      <PseudoPoint point={interactionState.point} />
    </Group>
  );
});

const DesignEditPath = memo(function DesignEditPath() {
  const { canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const renderingMode = useRenderingMode();
  const interactionState = state.interactionState;
  const isEditingPath = Selectors.getIsEditingPath(interactionState.type);
  const page = Selectors.getCurrentPage(state);

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

  if (
    renderingMode !== 'interactive' ||
    interactionState.type === 'drawingShapePath' ||
    !isEditingPath
  ) {
    return <></>;
  }

  return (
    <Group transform={canvasTransform}>
      {editablePaths}
      {editPathPseudoElements}
      <InsertPointOverlay />
    </Group>
  );
});

function useBoundingRect() {
  const [state] = useApplicationState();
  const page = Selectors.getCurrentPage(state);
  const boundingRect = useMemo(
    () =>
      Selectors.getBoundingRect(page, state.selectedLayerIds, {
        groups: 'childrenOnly',
        includeHiddenLayers: true,
      }),
    [page, state.selectedLayerIds],
  );
  return boundingRect;
}

const DesignBoundingRect = memo(function DesignBoundingRect() {
  const { canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const renderingMode = useRenderingMode();
  const interactionState = state.interactionState;
  const isEditingPath = Selectors.getIsEditingPath(interactionState.type);
  const isEditingText = Selectors.getIsEditingText(interactionState.type);
  const isEditingBlock = interactionState.type === 'editingBlock';
  const boundingRect = useBoundingRect();
  const { secondary } = useTheme().colors;

  if (
    renderingMode !== 'interactive' ||
    interactionState.type === 'drawingShapePath' ||
    interactionState.type === 'drawing' ||
    interactionState.type === 'insert' ||
    state.selectedGradient ||
    !boundingRect ||
    isEditingPath ||
    !(
      state.selectedLayerIds.length > 1 ||
      !Selectors.getSelectedLineLayer(state)
    )
  ) {
    return <></>;
  }

  const strokeColor = isEditingBlock ? secondary : undefined;

  return (
    <Group transform={canvasTransform}>
      {isEditingBlock && boundingRect && (
        <FloatingBubbleLabel
          rect={boundingRect}
          text="Editing Elements"
          color={strokeColor}
        />
      )}
      <BoundingRect rect={boundingRect} strokeColor={strokeColor} />
      {!isEditingText &&
        state.selectedLayerIds.map((layerId) => (
          <RotatedBoundingRect
            key={layerId}
            layerId={layerId}
            strokeColor={strokeColor}
            strokeWidth={isEditingBlock ? 1 : undefined}
          />
        ))}
    </Group>
  );
});

/**
 * When editing a custom layer, we draw a transparent overlay over the rest of the canvas.
 * We draw this overlay in 4 black strips, contained within a transparent group.
 */
const DesignIsolateEditingLayer = memo(function DesignIsolateEditingLayer() {
  const CanvasKit = useCanvasKit();
  const { canvasSize, canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const interactionState = state.interactionState;
  const isEditingBlock = interactionState.type === 'editingBlock';
  const boundingRect = useBoundingRect();
  const blackFill = useColorFill('black');
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);

  if (!isEditingBlock || !boundingRect) return <></>;

  const bounds = createBounds(
    pixelAlignRect(transformRect(boundingRect, canvasTransform), 1),
  );

  const canvasBounds = createBounds(canvasSize);

  const topRect = createRect(
    { x: canvasBounds.minX, y: canvasBounds.minY },
    { x: canvasBounds.maxX, y: bounds.minY },
  );

  const bottomRect = createRect(
    { x: canvasBounds.minX, y: bounds.maxY },
    { x: canvasBounds.maxX, y: canvasBounds.maxY },
  );

  const leftRect = createRect(
    { x: canvasBounds.minX, y: bounds.minY },
    { x: bounds.minX, y: bounds.maxY },
  );

  const rightRect = createRect(
    { x: bounds.maxX, y: bounds.minY },
    { x: canvasBounds.maxX, y: bounds.maxY },
  );

  return (
    <Group opacity={0.2}>
      <RCKRect rect={Primitives.rect(CanvasKit, topRect)} paint={blackFill} />
      <RCKRect
        rect={Primitives.rect(CanvasKit, bottomRect)}
        paint={blackFill}
      />
      <RCKRect rect={Primitives.rect(CanvasKit, leftRect)} paint={blackFill} />
      <RCKRect rect={Primitives.rect(CanvasKit, rightRect)} paint={blackFill} />
    </Group>
  );
});

const DesignLayerHighlight = memo(function DesignLayerHighlight() {
  const { canvasInsets, highlightedLayer } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const renderingMode = useRenderingMode();
  const interactionState = state.interactionState;
  const isEditingPath = Selectors.getIsEditingPath(interactionState.type);
  const isEditingText = Selectors.getIsEditingText(interactionState.type);
  const page = Selectors.getCurrentPage(state);

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

  if (
    renderingMode !== 'interactive' ||
    interactionState.type === 'drawingShapePath' ||
    interactionState.type === 'selectionMode' ||
    interactionState.type === 'marquee' ||
    isEditingPath ||
    interactionState.type === 'drawing' ||
    interactionState.type === 'insert' ||
    isEditingText
  ) {
    return <></>;
  }

  return <Group transform={canvasTransform}>{highlightedSketchLayer}</Group>;
});

const DesignDrawLayer = memo(function DesignDrawLayer() {
  const { canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const renderingMode = useRenderingMode();
  const interactionState = state.interactionState;

  const CanvasKit = useCanvasKit();
  const { zoomValue } = Selectors.getCurrentPageMetadata(state);

  if (renderingMode !== 'interactive' || interactionState.type !== 'drawing') {
    return <></>;
  }

  const drawingLayer = createDrawingLayer(
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
    interactionState.options ?? getScalingOptions(state.keyModifiers),
    state.lastEditedTextStyle,
  );

  return (
    <Group transform={canvasTransform}>
      <SketchLayer layer={drawingLayer} />
    </Group>
  );
});

const DesignSnapGuides = memo(function DesignSnapGuides({
  showLabels = true,
}: {
  showLabels?: boolean;
}) {
  const { canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const renderingMode = useRenderingMode();
  const interactionState = state.interactionState;
  const isEditingPath = Selectors.getIsEditingPath(interactionState.type);

  if (
    renderingMode !== 'interactive' ||
    interactionState.type === 'drawingShapePath' ||
    isEditingPath
  ) {
    return <></>;
  }

  return (
    <Group transform={canvasTransform}>
      <SnapGuides showLabels={showLabels} />
    </Group>
  );
});

const DesignMeasurementGuides = memo(function DesignMeasurementGuides({
  showLabels = true,
}: {
  showLabels?: boolean;
}) {
  const { canvasInsets, highlightedLayer } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const renderingMode = useRenderingMode();
  const interactionState = state.interactionState;
  const isEditingPath = Selectors.getIsEditingPath(interactionState.type);
  const boundingRect = useBoundingRect();
  const page = Selectors.getCurrentPage(state);

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
            {showLabels && (
              <DistanceMeasurementLabel
                key={index}
                points={guide.measurement}
              />
            )}
          </>
        ))}
      </>
    );
  }, [
    highlightedLayer,
    boundingRect,
    state.selectedLayerIds,
    page,
    showLabels,
  ]);

  if (
    renderingMode !== 'interactive' ||
    interactionState.type === 'drawingShapePath' ||
    isEditingPath
  ) {
    return <></>;
  }

  return <Group transform={canvasTransform}>{quickMeasureGuides}</Group>;
});

const DesignDragHandles = memo(function DesignDragHandles() {
  const { canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const canvasTransform = Selectors.getCanvasTransform(state, canvasInsets);
  const renderingMode = useRenderingMode();
  const interactionState = state.interactionState;
  const isEditingPath = Selectors.getIsEditingPath(interactionState.type);
  const isEditingText = Selectors.getIsEditingText(interactionState.type);
  const boundingRect = useBoundingRect();

  if (
    renderingMode !== 'interactive' ||
    interactionState.type === 'drawingShapePath' ||
    isEditingPath ||
    state.selectedGradient ||
    interactionState.type === 'drawing' ||
    interactionState.type === 'insert' ||
    isEditingText ||
    interactionState.type === 'editingBlock' ||
    !boundingRect
  ) {
    return <></>;
  }

  return (
    <Group transform={canvasTransform}>
      <DragHandles rect={boundingRect} />
    </Group>
  );
});

const DesignRoot = memo(function DesignRoot({
  children,
}: {
  children: ReactNode;
}) {
  const { canvasSize, canvasInsets } = useWorkspace();
  const [state] = useApplicationState();
  const renderingMode = useRenderingMode();
  const { zoomValue } = Selectors.getCurrentPageMetadata(state);

  const rootScaleTransform = useRootScaleTransform();

  const clippedLayerMap = useMemo(
    () =>
      renderingMode === 'static'
        ? {}
        : getClippedLayerMap(state, canvasSize, canvasInsets),
    [canvasInsets, canvasSize, renderingMode, state],
  );

  return (
    <ClippedLayerProvider value={clippedLayerMap}>
      <ZoomProvider value={zoomValue}>
        <Group transform={rootScaleTransform}>{children}</Group>
      </ZoomProvider>
    </ClippedLayerProvider>
  );
});

export const Design = {
  Root: DesignRoot,
  Background: DesignBackground,
  Page: DesignPage,
  PixelGrid: DesignPixelGrid,
  Marquee: DesignMarquee,
  GradientEditor: DesignGradientEditor,
  InsertSymbol: DesignInsertSymbol,
  DrawPath: DesignDrawPath,
  EditPath: DesignEditPath,
  BoundingRect: DesignBoundingRect,
  LayerHighlight: DesignLayerHighlight,
  DrawLayer: DesignDrawLayer,
  SnapGuides: DesignSnapGuides,
  MeasurementGuides: DesignMeasurementGuides,
  DragHandles: DesignDragHandles,
  Rulers: DesignRulers,
  IsolateEditingLayer: DesignIsolateEditingLayer,
};

export const DesignFile = memo(function DesignFile() {
  return (
    <Design.Root>
      <Design.Background />
      <Design.Page />
      <Design.PixelGrid />
      <Design.Marquee />
      <Design.GradientEditor />
      <Design.InsertSymbol />
      <Design.DrawPath />
      <Design.EditPath />
      <Design.BoundingRect />
      <Design.LayerHighlight />
      <Design.DrawLayer />
      <Design.SnapGuides />
      <Design.MeasurementGuides />
      <Design.DragHandles />
      <Design.Rulers />
    </Design.Root>
  );
});
