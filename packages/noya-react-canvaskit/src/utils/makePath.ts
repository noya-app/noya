import { CanvasKit, Path } from 'canvaskit-types';
import { Point } from 'noya-geometry';

export default function makePath(CanvasKit: CanvasKit, points: Point[]): Path {
  const path = new CanvasKit.Path();

  const [first, ...rest] = points;

  if (!first) return path;

  path.moveTo(first.x, first.y);

  rest.forEach((point) => {
    path.lineTo(point.x, point.y);
  });

  path.close();

  return path;
}
