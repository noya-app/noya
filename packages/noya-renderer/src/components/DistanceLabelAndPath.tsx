import {
  Polyline,
  Text,
  useReactCanvasKit,
  Rect as RCKRect,
  useFontManager,
  usePaint,
  useColorFill,
} from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { createBounds, Point, Rect, distance } from 'noya-geometry';

type DistanceMeasurementProps = {
  distance: number;
  bounds: Point;
};

function DistanceMeasurement({ distance, bounds }: DistanceMeasurementProps) {
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
    builder.addText(distance.toString());

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, fontManager, distance]);

  const labelRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        bounds.x,
        bounds.y,
        paragraph.getMinIntrinsicWidth(),
        paragraph.getHeight(),
      ),
    [CanvasKit, paragraph, bounds],
  );

  const bgRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        bounds.x - 2,
        bounds.y - 1,
        paragraph.getMinIntrinsicWidth() + 5,
        paragraph.getHeight() + 2,
      ),
    [CanvasKit, paragraph, bounds],
  );

  const backgroundFill = useColorFill('rgb(43, 92, 207)');

  return (
    <>
      <RCKRect rect={bgRect} paint={backgroundFill} />
      <Text rect={labelRect} paragraph={paragraph} />
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

  let extensionGuideLines: Point[][] = [];
  let measureGuideLines: Point[][] = [];
  let distanceMeasurements: DistanceMeasurementProps[] = [];

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
    extensionGuideLines.push([
      { x: leftEdgeOfSelectedBounds, y: startY },
      {
        x: leftEdgeOfSelectedBounds,
        y: endY,
      },
    ]);

    measureGuideLines.push([
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
        x: (selectedBounds.minX + leftEdgeOfSelectedBounds) / 2,
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
    extensionGuideLines.push([
      { x: rightEdgeOfSelectedBounds, y: startY },
      {
        x: rightEdgeOfSelectedBounds,
        y: endY,
      },
    ]);

    measureGuideLines.push([
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
        x: (selectedBounds.maxX + rightEdgeOfSelectedBounds) / 2,
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
    extensionGuideLines.push([
      {
        x: startX,
        y: topEdgeOfSelectedBounds,
      },
      {
        x: endX,
        y: topEdgeOfSelectedBounds,
      },
    ]);

    measureGuideLines.push([
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
        y: (selectedBounds.minY + topEdgeOfSelectedBounds) / 2,
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
    extensionGuideLines.push([
      { x: startX, y: bottomEdgeOfSelectedBounds },
      {
        x: endX,
        y: bottomEdgeOfSelectedBounds,
      },
    ]);

    measureGuideLines.push([
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
        y: (selectedBounds.maxY + bottomEdgeOfSelectedBounds) / 2,
      },
      distance: itemDistance,
    });
  }

  const { CanvasKit } = useReactCanvasKit();

  const extensionGuidePaint = new CanvasKit.Paint();
  extensionGuidePaint.setColor(CanvasKit.Color4f(0.52, 0.248, 1.0));
  extensionGuidePaint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
  extensionGuidePaint.setStyle(CanvasKit.PaintStyle.Stroke);
  extensionGuidePaint.setStrokeWidth(1);

  const measureGuidePaint = usePaint({
    color: CanvasKit.Color4f(0.0, 0.2, 1.0),
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
  });

  return (
    <>
      {extensionGuideLines.map((points, index) => (
        <Polyline key={index} paint={extensionGuidePaint} points={points} />
      ))}
      {measureGuideLines.map((explicitPoints, index) => (
        <Polyline
          key={index}
          paint={measureGuidePaint}
          points={explicitPoints}
        />
      ))}
      {distanceMeasurements.map(
        (item: DistanceMeasurementProps, index: number) => (
          <DistanceMeasurement
            bounds={item.bounds}
            distance={item.distance}
            key={index}
          />
        ),
      )}
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
      />
    </>
  );
}
