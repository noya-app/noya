import React, {
  memo,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import produce from 'immer';

import { useApplicationState, useWorkspace } from 'noya-app-state-context';
// import Sketch from 'noya-file-format';
// import { AffineTransform, createRect, insetRect, Rect } from 'noya-geometry';
// import { useColorFill, useStroke } from 'noya-react-canvaskit';
// import { Polyline, useCanvasKit } from 'noya-renderer-web';
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
// import { useTheme } from 'styled-components';
import { useCanvasKit } from '../hooks/useCanvasKit';
// import { ClippedLayerProvider } from '../ClippedLayerContext';
// import { Group, Rect as RCKRect } from '../ComponentsContext';
import { ALL_DIRECTIONS, getGuides } from '../guides';
// import { useRenderingMode } from '../RenderingModeContext';
// import { useRootScale } from '../RootScaleContext';
// import { useZoom, ZoomProvider } from '../ZoomContext';
// import { DistanceMeasurementLabel } from './DistanceMeasurementLabel';
// import DragHandles from './DragHandles';
// import EditablePath from './EditablePath';
// import GradientEditor from './GradientEditor';
// import { ExtensionGuide, MeasurementGuide } from './Guides';
// import HoverOutline from './HoverOutline';
// import { InsertPointOverlay } from './InsertPointOverlay';
// import { SketchArtboardContent } from './layers/SketchArtboard';
// import SketchGroup from './layers/SketchGroup';
import SketchLayer from './layers/SketchLayer';
// import Marquee from './Marquee';
// import { PixelGrid } from './PixelGrid';
// import PseudoPathLine from './PseudoPathLine';
// import PseudoPoint from './PseudoPoint';
// import { HorizontalRuler } from './Rulers';
// import SnapGuides from './SnapGuides';

export const SketchFileDebugContext = React.createContext<{
  obj: Object;
  setDebug: (data: Object) => void;
}>({
  obj: {},
  setDebug: () => {
    console.log('wrong context');
  },
});

export const SketchFileDebugProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const objRef = useRef<Object>();

  const setDebug = (newObj: Object) => {
    objRef.current = newObj;
  };

  return (
    <SketchFileDebugContext.Provider
      value={{ obj: objRef.current || {}, setDebug }}
    >
      {children}
    </SketchFileDebugContext.Provider>
  );
};

export default React.memo(function SketchFileRenderer() {
  const debugCtx = useContext(SketchFileDebugContext);
  const {
    canvasSize,
    canvasInsets,
    preferences: { showRulers, showPixelGrid },
    highlightedLayer,
  } = useWorkspace();
  const [state] = useApplicationState();
  const interactionState = state.interactionState;
  const CanvasKit = useCanvasKit();
  // const renderingMode = useRenderingMode();
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

  // Fill
  // const {
  //   canvas: { background: backgroundColor },
  // } = useTheme().colors;
  // const backgroundFill = useColorFill(backgroundColor);

  const boundingRect = useMemo(
    () =>
      Selectors.getBoundingRect(page, state.selectedLayerIds, {
        groups: 'childrenOnly',
        includeHiddenLayers: true,
      }),
    [page, state.selectedLayerIds],
  );

  // useEffect(() => {
  debugCtx.setDebug({
    canvasSize,
    canvasInsets,
    showRulers,
    showPixelGrid,
    highlightedLayer,
    interactionState,
    state,
    page,
    screenTransform,
    canvasTransform,
    isEditingPath,
    isEditingText,
    isInserting,
    zoomValue,
    canvasRect,
  });
  // });

  // const quickMeasureGuides = useMemo(() => {
  //   if (
  //     !highlightedLayer ||
  //     !highlightedLayer.isMeasured ||
  //     !boundingRect ||
  //     state.selectedLayerIds.length === 0 ||
  //     state.selectedLayerIds.includes(highlightedLayer.id)
  //   ) {
  //     return;
  //   }

  //   const indexPath = Layers.findIndexPath(
  //     page,
  //     (layer) => layer.do_objectID === highlightedLayer.id,
  //   );

  //   if (!indexPath) return;

  //   const highlightedBoundingRect = Selectors.getBoundingRect(
  //     page,
  //     [highlightedLayer.id],
  //     {
  //       groups: 'childrenOnly',s
  //       includeHiddenLayers: true,
  //     },
  //   );

  //   if (!highlightedBoundingRect) return;

  //   const guides = ALL_DIRECTIONS.flatMap(([direction, axis]) => {
  //     const result = getGuides(
  //       direction,
  //       axis,
  //       boundingRect,
  //       highlightedBoundingRect,
  //     );

  //     return result ? [result] : [];
  //   });

  //   return (
  //     <>
  //       {guides.map((guide, index) => (
  //         <ExtensionGuide key={index} points={guide.extension} />
  //       ))}
  //       {guides.map((guide, index) => (
  //         <>
  //           <MeasurementGuide key={index} points={guide.measurement} />
  //           <DistanceMeasurementLabel key={index} points={guide.measurement} />
  //         </>
  //       ))}
  //     </>
  //   );
  // }, [highlightedLayer, page, state.selectedLayerIds, boundingRect]);

  // const highlightedSketchLayer = useMemo(() => {
  //   if (
  //     !highlightedLayer ||
  //     // Don't draw a highlight when hovering over a selected layer on the canvas
  //     (state.selectedLayerIds.includes(highlightedLayer.id) &&
  //       highlightedLayer.precedence === 'belowSelection')
  //   ) {
  //     return;
  //   }

  //   const indexPath = Layers.findIndexPath(
  //     page,
  //     (layer) => layer.do_objectID === highlightedLayer.id,
  //   );

  //   if (!indexPath) return;

  //   const layer = Layers.access(page, indexPath);
  //   const layerTransform = Selectors.getLayerTransformAtIndexPath(
  //     page,
  //     indexPath,
  //   );

  //   return (
  //     highlightedLayer && (
  //       <HoverOutline transform={layerTransform} layer={layer} />
  //     )
  //   );
  // }, [highlightedLayer, page, state.selectedLayerIds]);

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
      : null;

  // const rootScale = useRootScale();
  // const rootScaleTransform = useMemo(
  //   () => AffineTransform.scale(rootScale),
  //   [rootScale],
  // );

  return drawingLayer && <SketchLayer layer={drawingLayer} />;
});
