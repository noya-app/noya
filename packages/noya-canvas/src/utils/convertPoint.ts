import { AffineTransform, Point } from 'noya-geometry';

// Event coordinates are relative to (0,0), but we want them to include
// the current page's zoom and offset from the origin
export function convertPoint(
  scrollOrigin: Point,
  zoomValue: number,
  point: Point,
  targetCoordinateSystem: 'screen' | 'canvas',
): Point {
  const transform = AffineTransform.scale(1 / zoomValue).translate(
    -scrollOrigin.x,
    -scrollOrigin.y,
  );

  switch (targetCoordinateSystem) {
    case 'canvas':
      return transform.applyTo(point);
    case 'screen':
      return transform.invert().applyTo(point);
  }
}
