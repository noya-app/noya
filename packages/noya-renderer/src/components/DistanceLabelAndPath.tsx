import {
  Polyline,
  Text,
  useReactCanvasKit,
  Rect as RCKRect,
  useFontManager,
  useColorFill,
} from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { createBounds, Point, Rect, distance } from 'noya-geometry';

type DistanceMeasurement = {
  distance: number;
  bounds: Point;
};

function DistanceMeasurements(item: DistanceMeasurement) {
  const { CanvasKit } = useReactCanvasKit();
  const fontManager = useFontManager();
  const paragraph = useMemo(() => {
    const paragraphStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        color: CanvasKit.parseColorString('rgb(255,255,225)'),
        fontSize: 11,
        fontFamilies: ['Roboto'],
        letterSpacing: 0.2,
      },
    });

    const builder = CanvasKit.ParagraphBuilder.Make(
      paragraphStyle,
      fontManager,
    );
    builder.addText(item.distance.toString());

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, fontManager, item.distance]);

  const labelRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        item.bounds.x,
        item.bounds.y,
        paragraph.getMinIntrinsicWidth(),
        paragraph.getHeight(),
      ),
    [CanvasKit, paragraph, item],
  );

  const bgRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        item.bounds.x - 2,
        item.bounds.y - 1,
        paragraph.getMinIntrinsicWidth() + 5,
        paragraph.getHeight() + 2,
      ),
    [CanvasKit, paragraph, item],
  );

  const backgroundFill = useColorFill('rgb(43, 92, 207)');

  return (
    <>
      <RCKRect rect={bgRect} paint={backgroundFill} />
      <Text rect={labelRect} paragraph={paragraph}></Text>
    </>
  );
}

function MeasureAndExtensionPaths({
  selectedLayer,
  highlightedLayer,
}: {
  selectedLayer: Rect;
  highlightedLayer: Rect;
}) {
  const highlightedBounds = createBounds(highlightedLayer);
  const selectedBounds = createBounds(selectedLayer);

  let implicitLines: Point[][] = [];
  let explicitLines: Point[][] = [];
  let distanceMeasurements: DistanceMeasurement[] = [];

  const startY =
    highlightedBounds.midY < selectedBounds.midY
      ? highlightedBounds.maxY
      : highlightedBounds.minY;

  const endY =
    highlightedBounds.midY < selectedBounds.midY
      ? selectedBounds.maxY
      : selectedBounds.minY;

  let leftEdgeOfSelectedBounds =
    highlightedBounds.maxX < selectedBounds.minX
      ? highlightedBounds.maxX
      : highlightedBounds.maxX < selectedBounds.maxX
      ? highlightedBounds.minX
      : undefined;

  if (leftEdgeOfSelectedBounds !== undefined) {
    implicitLines.push([
      { x: leftEdgeOfSelectedBounds, y: startY },
      {
        x: leftEdgeOfSelectedBounds,
        y: endY,
      },
    ]);

    explicitLines.push([
      { x: selectedBounds.minX, y: selectedBounds.midY },
      {
        x: leftEdgeOfSelectedBounds,
        y: selectedBounds.midY,
      },
    ]);

    const itemDistance = distance(
      { x: selectedBounds.minX, y: selectedBounds.midY },
      {
        x: leftEdgeOfSelectedBounds,
        y: selectedBounds.midY,
      },
    );

    distanceMeasurements.push({
      distance: itemDistance,
      bounds: {
        x: selectedBounds.minX - itemDistance / 2,
        y: selectedBounds.midY,
      },
    });
  }

  let rightEdgeOfSelectedBounds =
    highlightedBounds.minX > selectedBounds.maxX
      ? highlightedBounds.minX
      : highlightedBounds.minX > selectedBounds.minX
      ? highlightedBounds.maxX
      : undefined;

  if (rightEdgeOfSelectedBounds !== undefined) {
    implicitLines.push([
      { x: rightEdgeOfSelectedBounds, y: startY },
      {
        x: rightEdgeOfSelectedBounds,
        y: endY,
      },
    ]);

    explicitLines.push([
      { x: selectedBounds.maxX, y: selectedBounds.midY },
      {
        x: rightEdgeOfSelectedBounds,
        y: selectedBounds.midY,
      },
    ]);

    const itemDistance = distance(
      { x: selectedBounds.maxX, y: selectedBounds.midY },
      {
        x: rightEdgeOfSelectedBounds,
        y: selectedBounds.midY,
      },
    );

    distanceMeasurements.push({
      bounds: {
        x: selectedBounds.maxX + itemDistance / 2,
        y: selectedBounds.midY,
      },
      distance: itemDistance,
    });
  }

  const startX =
    highlightedBounds.midX < selectedBounds.midX
      ? highlightedBounds.maxX
      : highlightedBounds.minX;

  const endX =
    highlightedBounds.midX < selectedBounds.midX
      ? selectedBounds.maxX
      : selectedBounds.minX;

  let topEdgeOfSelectedBounds =
    highlightedBounds.maxY < selectedBounds.minY
      ? highlightedBounds.maxY
      : highlightedBounds.maxY < selectedBounds.maxY
      ? highlightedBounds.minY
      : undefined;

  if (topEdgeOfSelectedBounds !== undefined) {
    implicitLines.push([
      {
        x: startX,
        y: topEdgeOfSelectedBounds,
      },
      {
        x: endX,
        y: topEdgeOfSelectedBounds,
      },
    ]);

    explicitLines.push([
      { x: selectedBounds.midX, y: selectedBounds.minY },
      {
        x: selectedBounds.midX,
        y: topEdgeOfSelectedBounds,
      },
    ]);

    const itemDistance = distance(
      { x: selectedBounds.midX, y: selectedBounds.minY },
      {
        x: selectedBounds.midX,
        y: topEdgeOfSelectedBounds,
      },
    );

    distanceMeasurements.push({
      bounds: {
        x: selectedBounds.midX,
        y: selectedBounds.minY - itemDistance / 2,
      },
      distance: itemDistance,
    });
  }

  let bottomEdgeOfSelectedBounds =
    highlightedBounds.minY > selectedBounds.maxY
      ? highlightedBounds.minY
      : highlightedBounds.minY > selectedBounds.minY
      ? highlightedBounds.maxY
      : undefined;

  if (bottomEdgeOfSelectedBounds !== undefined) {
    implicitLines.push([
      { x: startX, y: bottomEdgeOfSelectedBounds },
      {
        x: endX,
        y: bottomEdgeOfSelectedBounds,
      },
    ]);

    explicitLines.push([
      { x: selectedBounds.midX, y: selectedBounds.maxY },
      {
        x: selectedBounds.midX,
        y: bottomEdgeOfSelectedBounds,
      },
    ]);

    const itemDistance = distance(
      { x: selectedBounds.midX, y: selectedBounds.maxY },
      {
        x: selectedBounds.midX,
        y: bottomEdgeOfSelectedBounds,
      },
    );

    distanceMeasurements.push({
      bounds: {
        x: selectedBounds.midX,
        y: selectedBounds.maxY + itemDistance / 2,
      },
      distance: itemDistance,
    });
  }

  const { CanvasKit } = useReactCanvasKit();
  const paint = new CanvasKit.Paint();
  paint.setColor(CanvasKit.Color4f(0.52, 0.248, 1.0));
  paint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
  paint.setStyle(CanvasKit.PaintStyle.Stroke);
  paint.setStrokeWidth(1);

  const explicitPaint = new CanvasKit.Paint();
  explicitPaint.setColor(CanvasKit.Color4f(0.0, 0.2, 1.0));
  explicitPaint.setStyle(CanvasKit.PaintStyle.Stroke);
  explicitPaint.setStrokeWidth(1);

  return (
    <>
      {implicitLines.map((points, index) => (
        <Polyline key={index} paint={paint} points={points}></Polyline>
      ))}
      {explicitLines.map((explicitPoints, index) => (
        <Polyline
          key={index}
          paint={explicitPaint}
          points={explicitPoints}
        ></Polyline>
      ))}
      {distanceMeasurements.map((item: DistanceMeasurement, index: number) => (
        <DistanceMeasurements
          bounds={item.bounds}
          distance={item.distance}
          key={index}
        ></DistanceMeasurements>
      ))}
    </>
  );
}

export default function DistanceLabelAndPath({
  selectedLayer,
  highlightedLayer,
}: {
  selectedLayer: Rect;
  highlightedLayer: Rect;
}) {
  return (
    <>
      <MeasureAndExtensionPaths
        selectedLayer={selectedLayer}
        highlightedLayer={highlightedLayer}
      ></MeasureAndExtensionPaths>
    </>
  );
}
