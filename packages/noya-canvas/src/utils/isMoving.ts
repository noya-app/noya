import { Point } from '@noya-app/noya-geometry';

export function isMoving(
  point: Point,
  origin: Point,
  zoomValue: number,
): boolean {
  const threshold = 2 / zoomValue;

  return (
    Math.abs(point.x - origin.x) > threshold ||
    Math.abs(point.y - origin.y) > threshold
  );
}
