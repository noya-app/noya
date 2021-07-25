import { Orientation, Point } from './types';

// Returns the orientation of a line, assuming the line is either vertical or horizontal
export function getLineOrientation(points: [Point, Point]): Orientation {
  return points[0].x === points[1].x ? 'vertical' : 'horizontal';
}
