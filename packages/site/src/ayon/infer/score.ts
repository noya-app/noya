import { Rect } from 'noya-geometry';

export function isWithinRectRange({
  rect,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
}: {
  rect: Rect;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}) {
  return (
    (!minWidth || rect.width >= minWidth) &&
    (!maxWidth || rect.width <= maxWidth) &&
    (!minHeight || rect.height >= minHeight) &&
    (!maxHeight || rect.height <= maxHeight)
  );
}

export function isApproximatelySquare(rect: Rect, tolerance: number) {
  return (
    Math.abs(rect.width - rect.height) <=
    tolerance * Math.min(rect.width, rect.height)
  );
}
