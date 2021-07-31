import { getLineOrientation, Orientation, Point } from 'noya-geometry';
import { round } from 'noya-utils';

export function pixelAlignPoint(
  point: Point,
  orientation: Orientation,
  lineThickness = 1,
) {
  return {
    x: round(point.x) + (orientation === 'vertical' ? lineThickness / 2 : 0),
    y: round(point.y) + (orientation === 'horizontal' ? lineThickness / 2 : 0),
  };
}

export function pixelAlignPoints(
  points: [Point, Point],
  lineThickness = 1,
): [Point, Point] {
  const orientation = getLineOrientation(points);

  return [
    pixelAlignPoint(points[0], orientation, lineThickness),
    pixelAlignPoint(points[1], orientation, lineThickness),
  ];
}
