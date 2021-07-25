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

export function pixelAlignPoints(points: [Point, Point], lineThickness = 1) {
  const orientation = getLineOrientation(points);

  return points.map((point) =>
    pixelAlignPoint(point, orientation, lineThickness),
  );
}
