import type { CanvasKit, Paint, Path } from 'canvaskit-wasm';
import type Sketch from '@sketch-hq/sketch-file-format-ts';

export function color(CanvasKit: CanvasKit, color: Sketch.Color) {
  return CanvasKit.Color4f(color.red, color.green, color.blue, color.alpha);
}

export function rect(CanvasKit: CanvasKit, rect: Sketch.Rect) {
  return CanvasKit.XYWHRect(rect.x, rect.y, rect.width, rect.height);
}

export function clearColor(CanvasKit: CanvasKit) {
  return CanvasKit.Color4f(0, 0, 0, 0);
}

export function fill(CanvasKit: CanvasKit, fill: Sketch.Fill): Paint {
  const paint = new CanvasKit.Paint();

  paint.setColor(
    fill.color ? color(CanvasKit, fill.color) : clearColor(CanvasKit),
  );
  paint.setStyle(CanvasKit.PaintStyle.Fill);
  paint.setAntiAlias(true);

  // paint.setMaskFilter(
  //   CanvasKit.MaskFilter.MakeBlur(CanvasKit.BlurStyle.Normal, 5, true),
  // );

  return paint;
}

export function parsePoint(pointString: string): { x: number; y: number } {
  const [x, y] = pointString.slice(1, -1).split(',');

  return {
    x: parseFloat(x),
    y: parseFloat(y),
  };
}

function zip<A, B>(array1: A[], array2: B[]): [A, B][] {
  return array1.map((item1, index) => [item1, array2[index]]);
}

export function path(
  CanvasKit: CanvasKit,
  points: Sketch.CurvePoint[],
  frame: Sketch.Rect,
): Path {
  const { x, y, width, height } = frame;

  const scalePoint = (point: { x: number; y: number }) => {
    return { x: x + point.x * width, y: y + point.y * height };
  };

  const curvePoints = [...points].map((curvePoint) => ({
    ...curvePoint,
    curveFrom: curvePoint.curveTo,
    curveTo: curvePoint.curveFrom,
  }));

  const pairs = zip(curvePoints, [
    ...curvePoints.slice(1),
    ...curvePoints.slice(0, 1),
  ]);

  const path = new CanvasKit.Path();

  if (pairs[0]) {
    const [current] = pairs[0];
    const currentPoint = scalePoint(parsePoint(current.point));
    path.moveTo(currentPoint.x, currentPoint.y);
  }

  pairs.forEach((pair) => {
    const [current, next] = pair;
    const currentCurveTo = scalePoint(parsePoint(current.curveTo));
    const nextCurveFrom = scalePoint(parsePoint(next.curveFrom));
    const nextPoint = scalePoint(parsePoint(next.point));

    path.cubicTo(
      currentCurveTo.x,
      currentCurveTo.y,
      nextCurveFrom.x,
      nextCurveFrom.y,
      nextPoint.x,
      nextPoint.y,
    );
  });

  path.close();

  return path;
}
