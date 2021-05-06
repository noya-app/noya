import {
  useApplicationState,
  useWorkspace,
} from 'app/src/contexts/ApplicationStateContext';
import * as CanvasKit from 'canvaskit-wasm';
import { AffineTransform, createRect, insetRect } from 'noya-geometry';
import {
  Group,
  Polyline,
  Text,
  Path,
  Rect as RCKRect,
  useColorFill,
  usePaint,
  useReactCanvasKit,
  useFontManager,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { InteractionState, Layers, Rect, Point } from 'noya-state';
import { findIndexPath } from 'noya-state/src/layers';
import {
  getBoundingPoints,
  getBoundingRect,
  getCanvasTransform,
  getCurrentPage,
  getLayerTransformAtIndexPath,
  getScreenTransform,
  getLayersInRect,
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

  const visibleLayersInCanvas = function(){
    const layers = getLayersInRect(
      CanvasKit,
      state,
      canvasInsets,
      createRect({x: 0, y: 0 }, {x: canvasSize.height, y: canvasSize.width }),
      {
        clickThroughGroups: false,
        includeHiddenLayers: false,
      },
    );
    return layers;
  }

  function measureDistanceBetweenVisibleLayers(selectedLayer: any, visibleLayers: any){
    let distanceArray: number[] = [];
    let closestLayer: any;
    const selectedLayerCeneterPointX = selectedLayer.frame.x + selectedLayer.frame.width / 2;
    const selectedLayerCeneterPointY = selectedLayer.frame.y + selectedLayer.frame.height / 2;

    visibleLayers.forEach(function(layer: any){
      if(selectedLayer.do_objectID !== layer.do_objectID){
        //calculate center point
        const visibleLayerCeneterPointX = layer.frame.x + layer.frame.width / 2;
        const visibleLayerCeneterPointY = layer.frame.y + layer.frame.height / 2;

        const distanceSquared =
        Math.pow(selectedLayerCeneterPointX - visibleLayerCeneterPointX, 2) + Math.pow(selectedLayerCeneterPointY - visibleLayerCeneterPointY, 2);
        const distance = Math.sqrt(distanceSquared)
        distanceArray.push(distance);

        if (!closestLayer || (closestLayer && distance < closestLayer.distance)){
          closestLayer = {layer: layer, distance: distance};
        } 
      }
    })  
    //const closestDistance = Math.min(...distanceArray);
    return closestLayer;
  }
  
  function makePath(CanvasKit: any, points: Point[]) {
    const path = new CanvasKit.Path();
  
    const [first, ...rest] = points;
  
    if (!first) return path;
  
    path.moveTo(first.x, first.y);
  
    rest.forEach((point) => {
      path.lineTo(point.x, point.y);
    });
  
    path.close();
  
    return path;
  }

  function DistanceLabelAndPath({ labelText, labelOrigin, pathStartPoint, pathEndPoint }: { labelText: string; labelOrigin: Point; pathStartPoint: Point; pathEndPoint:Point }) {
    const fontManager = useFontManager();
    const paragraph = useMemo(() => {
      const paragraphStyle = new CanvasKit.ParagraphStyle({
        textStyle: {
          color: CanvasKit.parseColorString('ff0000'),
          fontSize: 11,
          fontFamilies: ['Roboto'],
          letterSpacing: 0.2,
        },
      });

    const builder = CanvasKit.ParagraphBuilder.Make(
      paragraphStyle,
      fontManager,
    );
    builder.addText(labelText);

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, fontManager, labelText, 'ff0000']);

    const labelRect = useMemo(
      () =>
        CanvasKit.XYWHRect(
          labelOrigin.x,
          labelOrigin.y,
          paragraph.getMinIntrinsicWidth(),
          paragraph.getHeight(),
        ),
      [CanvasKit, paragraph, 0, 0],
    );

    const points=[
      pathStartPoint,
      pathEndPoint
    ]

    const pathToSibling = makePath(CanvasKit, points);
    const strokeToSibling = usePaint({
      color: CanvasKit.Color(255, 69, 0, 0.9),
      strokeWidth: 1,
      style: CanvasKit.PaintStyle.Stroke,
      });

    return <>
    <Text rect={labelRect} paragraph={paragraph} />
    <Path paint={strokeToSibling} path={pathToSibling}></Path>
    </>;
  }

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
    
    let closestLayer;
    let closestLayerDistance;
    if(highlightedLayer.isMeasured){
      const layersToMeasureDistance = visibleLayersInCanvas();
      closestLayer = measureDistanceBetweenVisibleLayers(layer, layersToMeasureDistance).layer
      closestLayerDistance = Math.round(measureDistanceBetweenVisibleLayers(layer, layersToMeasureDistance).distance)
    } 
    
    return (
      highlightedLayer && (
        <>
          <HoverOutline
            transform={layerTransform}
            layer={layer}
            paint={highlightPaint}
           />
           {closestLayerDistance && 
             <DistanceLabelAndPath
             labelOrigin={{ x: layer.frame.x, y: layer.frame.y }}
             labelText={closestLayerDistance.toString()}
             pathStartPoint={{x: layer.frame.x, y: layer.frame.y}}
             pathEndPoint={{x: closestLayer.frame.x, y: closestLayer.frame.y}}
           />}
        </>
      )
    );
  }, [highlightPaint, highlightedLayer, page, state.selectedObjects]);

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
        {highlightedSketchLayer}
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
