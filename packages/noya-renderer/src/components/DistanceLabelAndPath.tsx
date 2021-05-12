import {
  Polyline,
  Text,
  usePaint,
  useReactCanvasKit,
  useFontManager,
} from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { createBounds, Point, Rect } from 'noya-geometry';

// calculate the angle between two points: https://stackoverflow.com/questions/9614109/how-to-calculate-an-angle-from-points/9614122#9614122
// function angle360(cx: number, cy: number, ex: number, ey: number) {
//   var theta = angle(cx, cy, ex, ey); // range (-180, 180]
//   if (theta < 0) theta = 360 + theta; // range [0, 360)
//   return Math.round(theta);
// }

// function angle(cx: number, cy: number, ex: number, ey: number) {
//   const dy = ey - cy;
//   const dx = ex - cx;
//   let theta = Math.atan2(dy, dx);
//   theta *= 180 / Math.PI;
//   return theta;
// }

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

  let leftEdgeOfSelectedBounds =
    highlightedBounds.maxX < selectedBounds.minX
      ? highlightedBounds.maxX
      : highlightedBounds.minX < selectedBounds.minX
      ? highlightedBounds.minX
      : undefined;

  if (leftEdgeOfSelectedBounds !== undefined) {
    implicitLines.push([
      { x: leftEdgeOfSelectedBounds, y: highlightedBounds.minY },
      {
        x: leftEdgeOfSelectedBounds,
        y:
          highlightedBounds.midY < selectedBounds.midY
            ? selectedBounds.maxY
            : selectedBounds.minY,
      },
    ]);
  }

  let rightEdgeOfSelectedBounds =
    highlightedBounds.minX > selectedBounds.maxX
      ? highlightedBounds.minX
      : highlightedBounds.maxX > selectedBounds.maxX
      ? highlightedBounds.maxX
      : undefined;

  if (rightEdgeOfSelectedBounds !== undefined) {
    implicitLines.push([
      { x: rightEdgeOfSelectedBounds, y: highlightedBounds.minY },
      {
        x: rightEdgeOfSelectedBounds,
        y:
          highlightedBounds.midY < selectedBounds.midY
            ? selectedBounds.maxY
            : selectedBounds.minY,
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
  // Draw explicit lines from intrensic lines
  // Calculate distance

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

  const points = [
    { x: 0, y: 0 },
    { x: 100, y: 100 },
  ];

  const stroke = usePaint({
    color: CanvasKit.Color(255, 69, 0, 0.9),
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
  });

  return (
    <>
      <Text rect={labelRect} paragraph={paragraph} />
      <Polyline paint={stroke} points={points}></Polyline>
      <ImplicitPaths
        selectedLayer={selectedLayer}
        highlightedLayer={highlightedLayer}
      ></ImplicitPaths>
    </>
  );
}
