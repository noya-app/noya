import { clamp } from 'noya-utils';
import { distance } from './point';
import { Point } from './types';

// http://paulbourke.net/geometry/pointlineplane/
export function getClosestPointOnLine(
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
  const p = getClosestPointOnLine(point, line);

  const [p1, p2] = line;

  if (p2.x - p1.x !== 0) {
    return clamp((p.x - p1.x) / (p2.x - p1.x), 0, 1);
  }

  // If the line is vertical
  return clamp((p.y - p1.y) / (p2.y - p1.y), 0, 1);
}

export function isPointInLine(point: Point, line: [Point, Point]) {
  //get distance from the point to the two ends of the line
  const d1 = distance(point, line[0]);
  const d2 = distance(point, line[1]);

  const lineLength = distance(line[0], line[1]);

  return Math.abs(d1 + d2 - lineLength) < 0.5;
}

// TODO: Not really accurate, but works for now.
// TODO: add a test for this function
export function isPointInCircunference(point: Point, circle: [Point, number]) {
  const center = circle[0];
  const radius = circle[1];

  return Math.abs(distance(point, center) - radius) < 2;
}

export function getCircunferencePercentage(point: Point, center: Point) {
  let angle =
    (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI;

  if (angle < 0) {
    angle += 360;
  }
  return angle / 360;
}
