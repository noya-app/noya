import type { CanvasKit, CanvasKitInit, Canvas } from 'canvaskit-wasm';
import type Sketch from '@sketch-hq/sketch-file-format-ts';
import * as Primitives from './primitives';
import { color } from './primitives';

export interface Context {
  CanvasKit: CanvasKit;
  canvas: Canvas;
}

export function drawLayer(context: Context, layer: Sketch.AnyLayer) {
  switch (layer._class) {
    case 'rectangle':
    case 'oval':
      return drawLayerShape(context, layer);
    default:
      console.log(layer._class, 'not handled');
      return;
  }
}

function zip<A, B>(array1: A[], array2: B[]): [A, B][] {
  return array1.map((item1, index) => [item1, array2[index]]);
}

export function drawLayerShape(
  context: Context,
  layer: Sketch.Rectangle | Sketch.Oval,
) {
  const { canvas, CanvasKit } = context;

  const fill = layer.style?.fills?.[0];

  if (!fill) return;

  const { x, y, width, height } = layer.frame;

  const scalePoint = (point: { x: number; y: number }) => {
    return { x: x + point.x * width, y: y + point.y * height };
  };

  const curvePoints = [...layer.points].map((curvePoint) => ({
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
    const currentPoint = scalePoint(Primitives.parsePoint(current.point));
    path.moveTo(currentPoint.x, currentPoint.y);
  }

  pairs.forEach((pair) => {
    const [current, next] = pair;
    // const currentPoint = scalePoint(Primitives.parsePoint(current.point));
    const currentCurveTo = scalePoint(Primitives.parsePoint(current.curveTo));
    const nextCurveFrom = scalePoint(Primitives.parsePoint(next.curveFrom));
    const nextPoint = scalePoint(Primitives.parsePoint(next.point));

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

  // const paint = new CanvasKit.Paint();

  // paint.setColor(color(CanvasKit, fill.color));
  // paint.setStyle(CanvasKit.PaintStyle.Stroke);
  // paint.setAntiAlias(true);

  // canvas.drawPath(path, paint);

  canvas.drawPath(path, Primitives.fill(CanvasKit, fill));
}

const init: typeof CanvasKitInit = require('canvaskit-wasm/bin/canvaskit.js');

export function load() {
  return init({
    locateFile: (file: string) =>
      'https://unpkg.com/canvaskit-wasm@^0.22.0/bin/' + file,
  });
}
