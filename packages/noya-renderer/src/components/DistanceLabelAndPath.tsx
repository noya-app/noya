import {
  Polyline,
  Text,
  useReactCanvasKit,
  useFontManager,
} from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { createBounds, Point, Rect } from 'noya-geometry';

function ImplicitPaths({
  selectedLayer,
  highlightedLayer,
}: {
  selectedLayer: Rect;
  highlightedLayer: Rect;
}) {
  const highlightedBounds = createBounds(highlightedLayer);
  const selectedBounds = createBounds(selectedLayer);

  let implicitLines: Point[][] = [];

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
  }

  const { CanvasKit } = useReactCanvasKit();

  const paint = new CanvasKit.Paint();
  paint.setColor(CanvasKit.Color4f(0.6, 0.2, 1.0));
  paint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
  paint.setStyle(CanvasKit.PaintStyle.Stroke);
  paint.setStrokeWidth(1);

  return (
    <>
      {implicitLines.map((points, index) => (
        <Polyline key={index} paint={paint} points={points}></Polyline>
      ))}
    </>
  );
}

export default function DistanceLabelAndPath({
  selectedLayer,
  highlightedLayer,
}: {
  selectedLayer: any;
  highlightedLayer: any;
}) {
  const { CanvasKit } = useReactCanvasKit();
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
    builder.addText('Test distance');

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, fontManager]);

  const labelRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        0,
        0,
        paragraph.getMinIntrinsicWidth(),
        paragraph.getHeight(),
      ),
    [CanvasKit, paragraph],
  );

  return (
    <>
      <Text rect={labelRect} paragraph={paragraph}></Text>
      <ImplicitPaths
        selectedLayer={selectedLayer}
        highlightedLayer={highlightedLayer}
      ></ImplicitPaths>
    </>
  );
}
