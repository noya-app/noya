import {
  Polyline,
  Text,
  usePaint,
  useReactCanvasKit,
  useFontManager,
} from 'noya-react-canvaskit';
import React, { useMemo } from 'react';

// calculate the angle between two points: https://stackoverflow.com/questions/9614109/how-to-calculate-an-angle-from-points/9614122#9614122
function angle360(cx: number, cy: number, ex: number, ey: number) {
  var theta = angle(cx, cy, ex, ey); // range (-180, 180]
  if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}

function angle(cx: number, cy: number, ex: number, ey: number) {
  const dy = ey - cy;
  const dx = ex - cx;
  let theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI;
  return theta;
}

function ImplicitPaths({
  selectedLayer,
  highlightedLayer,
}: {
  selectedLayer: any;
  highlightedLayer: any;
}) {
  // determine the angle between two points, then use the angle to determine coordinates for implicit paths
  const angleBetweenSelectedAndHighlightedLayer = angle360(
    selectedLayer.x,
    selectedLayer.y,
    highlightedLayer.x,
    highlightedLayer.y,
  );
  let xAxisPoints: any;
  let yAxisPoints: any;

  //TODO: clean up switch statment to use applicable coordinates
  switch (true) {
    case angleBetweenSelectedAndHighlightedLayer === 0 ||
      angleBetweenSelectedAndHighlightedLayer < 90:
      xAxisPoints = [
        {
          x: highlightedLayer.x + highlightedLayer.width,
          y: highlightedLayer.y,
        },
        { x: highlightedLayer.x + highlightedLayer.width, y: selectedLayer.y },
      ];

      yAxisPoints = [
        {
          x: highlightedLayer.x + highlightedLayer.width,
          y: highlightedLayer.y + highlightedLayer.height,
        },
        {
          x: selectedLayer.x + selectedLayer.width,
          y: highlightedLayer.y + highlightedLayer.height,
        },
      ];
      break;
    case angleBetweenSelectedAndHighlightedLayer === 90 ||
      angleBetweenSelectedAndHighlightedLayer < 180:
      xAxisPoints = [
        {
          x: highlightedLayer.x + highlightedLayer.width,
          y: highlightedLayer.y,
        },
        { x: highlightedLayer.x + highlightedLayer.width, y: selectedLayer.y },
      ];

      yAxisPoints = [
        {
          x: highlightedLayer.x + highlightedLayer.width,
          y: highlightedLayer.y + highlightedLayer.height,
        },
        {
          x: selectedLayer.x + selectedLayer.width,
          y: highlightedLayer.y + highlightedLayer.height,
        },
      ];
      break;
    case angleBetweenSelectedAndHighlightedLayer === 180 ||
      angleBetweenSelectedAndHighlightedLayer < 270:
      xAxisPoints = [
        {
          x: highlightedLayer.x + highlightedLayer.width,
          y: highlightedLayer.y,
        },
        { x: highlightedLayer.x + highlightedLayer.width, y: selectedLayer.y },
      ];

      yAxisPoints = [
        {
          x: highlightedLayer.x + highlightedLayer.width,
          y: highlightedLayer.y + highlightedLayer.height,
        },
        {
          x: selectedLayer.x + selectedLayer.width,
          y: highlightedLayer.y + highlightedLayer.height,
        },
      ];
      break;
    case angleBetweenSelectedAndHighlightedLayer === 270 ||
      angleBetweenSelectedAndHighlightedLayer <= 360:
      xAxisPoints = [
        {
          x: highlightedLayer.x + highlightedLayer.width,
          y: highlightedLayer.y,
        },
        { x: highlightedLayer.x + highlightedLayer.width, y: selectedLayer.y },
      ];

      yAxisPoints = [
        {
          x: highlightedLayer.x + highlightedLayer.width,
          y: highlightedLayer.y + highlightedLayer.height,
        },
        {
          x: selectedLayer.x + selectedLayer.width,
          y: highlightedLayer.y + highlightedLayer.height,
        },
      ];
      break;
  }

  const { CanvasKit } = useReactCanvasKit();

  const paint = new CanvasKit.Paint();
  paint.setColor(CanvasKit.Color4f(0.6, 0.2, 1.0));
  paint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
  paint.setStyle(CanvasKit.PaintStyle.Stroke);
  paint.setStrokeWidth(1);

  return (
    <>
      <Polyline paint={paint} points={xAxisPoints}></Polyline>
      <Polyline paint={paint} points={yAxisPoints}></Polyline>
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
  // Find all intrensic lines
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
