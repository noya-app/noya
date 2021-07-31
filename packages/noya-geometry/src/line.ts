import { clamp } from 'noya-utils';
import { Point } from './types';

// http://paulbourke.net/geometry/pointlineplane/
export function getPerpendicularPointOnLine(
  point: Point,
  line: [Point, Point],
): Point {
  const { x: x3, y: y3 } = point;
  const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = line;
  const dx = x2 - x1;
  const dy = y2 - y1;

  const u = ((x3 - x1) * dx + (y3 - y1) * dy) / (dx * dx + dy * dy);

  return {
    x: x1 + u * dx,
    y: y1 + u * dy,
  };
}

export function getLinePercentage(point: Point, line: [Point, Point]) {
  const p = getPerpendicularPointOnLine(point, line);

  const [p1, p2] = line;

  return clamp((p.x - p1.x) / (p2.x - p1.x), 0, 1);
}