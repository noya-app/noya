import type { CanvasKit, Paint } from 'canvaskit-wasm';
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
