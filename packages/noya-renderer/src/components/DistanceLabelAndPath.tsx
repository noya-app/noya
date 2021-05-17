import { Bounds, createBounds, distance, Point, Rect } from 'noya-geometry';
import {
  Polyline,
  Rect as RCKRect,
  Text,
  useColorFill,
  useFontManager,
  usePaint,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import React, { useMemo } from 'react';

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

type BoundsKey = keyof Bounds;
type Axis = 'x' | 'y';
type Direction = '+' | '-';

const ALL_DIRECTIONS = [
  ['+', 'x'],
  ['-', 'x'],
  ['+', 'y'],
  ['-', 'y'],
] as const;

function getAxisProperties(
  axis: Axis,
  direction: Direction,
): [BoundsKey, BoundsKey, BoundsKey] {
  switch (`${direction}${axis}` as const) {
    case '+x':
      return ['minX', 'midX', 'maxX'];
    case '-x':
      return ['maxX', 'midX', 'minX'];
    case '+y':
      return ['minY', 'midY', 'maxY'];
    case '-y':
      return ['maxY', 'midY', 'minY'];
  }
}

function getGuides(
  mainDirection: Direction,
  mainAxis: Axis,
  selected: Bounds,
  highlighted: Bounds,
) {
  const m = mainAxis;
  const c = mainAxis === 'x' ? 'y' : 'x';

  const [minM, , maxM] = getAxisProperties(m, mainDirection);
  const [minC, midC, maxC] = getAxisProperties(c, '+');

  const [startC, endC] =
    selected[midC] > highlighted[midC]
      ? [highlighted[maxC], selected[maxC]]
      : [highlighted[minC], selected[minC]];

  // Is `a` further along the direction of the primary axis than `b`?
  const isFurther = (a: number, b: number) =>
    mainDirection === '+' ? a > b : a < b;

  let edge = isFurther(selected[minM], highlighted[maxM])
    ? highlighted[maxM]
    : isFurther(selected[maxM], highlighted[maxM]) ||
      isFurther(selected[minM], highlighted[minM])
    ? highlighted[minM]
    : undefined;

  if (edge === undefined) return;

  const extension = [
    { [m]: edge, [c]: startC } as Point,
    { [m]: edge, [c]: endC } as Point,
  ];

  const measurement = [
    { [m]: selected[minM], [c]: selected[midC] } as Point,
    { [m]: edge, [c]: selected[midC] } as Point,
  ];

  const itemDistance = distance(
    { [m]: selected[minM], [c]: selected[midC] } as Point,
    { [m]: edge, [c]: selected[midC] } as Point,
  );

  const distanceMeasurement: DistanceMeasurementProps = {
    distance: itemDistance,
    bounds: { [m]: (selected[minM] + edge) / 2, [c]: selected[midC] } as Point,
  };

  return { extension, measurement, distanceMeasurement };
}

export default function DistanceLabelAndPath({
  selectedRect,
  highlightedRect,
}: {
  selectedRect: Rect;
  highlightedRect: Rect;
}) {
  const highlightedBounds = createBounds(highlightedRect);
  const selectedBounds = createBounds(selectedRect);

  const guides = ALL_DIRECTIONS.flatMap(([direction, axis]) => {
    const result = getGuides(
      direction,
      axis,
      selectedBounds,
      highlightedBounds,
    );

    return result ? [result] : [];
  });

  const { CanvasKit } = useReactCanvasKit();

  const extensionGuidePaint = new CanvasKit.Paint();
  extensionGuidePaint.setColor(CanvasKit.Color4f(0.52, 0.248, 1.0));
  extensionGuidePaint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
  extensionGuidePaint.setStyle(CanvasKit.PaintStyle.Stroke);
  extensionGuidePaint.setStrokeWidth(1);

  const measurementGuidePaint = usePaint({
    color: CanvasKit.Color4f(0.0, 0.2, 1.0),
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
  });

  const extensionGuides = guides.map((line) => line.extension);
  const measurementGuides = guides.map((line) => line.measurement);
  const distanceMeasurements = guides.map((line) => line.distanceMeasurement);

  return (
    <>
      {extensionGuides.map((points, index) => (
        <Polyline key={index} paint={extensionGuidePaint} points={points} />
      ))}
      {measurementGuides.map((explicitPoints, index) => (
        <Polyline
          key={index}
          paint={measurementGuidePaint}
          points={explicitPoints}
        />
      ))}
      {distanceMeasurements.map((item, index) => (
        <DistanceMeasurement
          key={index}
          bounds={item.bounds}
          distance={item.distance}
        />
      ))}
    </>
  );
}
