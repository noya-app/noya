import Sketch from '@sketch-hq/sketch-file-format-ts';
import type { Canvas, CanvasKit, CanvasKitInit } from 'canvaskit-wasm';
import { v4 as uuid } from 'uuid';
import * as Primitives from './primitives';

export { uuid };

export interface Context {
  CanvasKit: CanvasKit;
  canvas: Canvas;
}

export function drawLayer(context: Context, layer: Sketch.AnyLayer) {
  switch (layer._class) {
    case 'artboard':
      return drawArtboard(context, layer);
    case 'rectangle':
    case 'oval':
      return drawLayerShape(context, layer);
    default:
      console.log(layer._class, 'not handled');
      return;
  }
}

export function drawArtboard(context: Context, artboard: Sketch.Artboard) {
  const { canvas, CanvasKit } = context;

  const paint = new CanvasKit.Paint();
  paint.setColor(CanvasKit.WHITE);
  paint.setStyle(CanvasKit.PaintStyle.Fill);
  paint.setAntiAlias(true);

  const blur = new CanvasKit.Paint();
  blur.setColor(CanvasKit.BLACK);
  blur.setAlphaf(0.2);
  blur.setMaskFilter(
    CanvasKit.MaskFilter.MakeBlur(CanvasKit.BlurStyle.Normal, 2, true),
  );

  const rect = Primitives.rect(CanvasKit, artboard.frame);
  const blurRect = Primitives.rect(CanvasKit, {
    ...artboard.frame,
    y: artboard.frame.y + 1,
  });

  canvas.drawRect(blurRect, blur);
  canvas.drawRect(rect, paint);
}

export function drawLayerShape(
  context: Context,
  layer: Sketch.Rectangle | Sketch.Oval,
) {
  const { canvas, CanvasKit } = context;

  const path = Primitives.path(CanvasKit, layer.points, layer.frame);

  path.setFillType(CanvasKit.FillType.EvenOdd);

  if (!layer.style) return;

  const fills = (layer.style.fills ?? []).slice().reverse();
  const borders = (layer.style.borders ?? []).slice().reverse();

  fills.forEach((fill) => {
    if (!fill.isEnabled) return;

    canvas.drawPath(path, Primitives.fill(CanvasKit, fill));
  });

  borders.forEach((border) => {
    if (!border.isEnabled || border.thickness === 0) return;

    const paint = Primitives.border(CanvasKit, border);

    canvas.save();

    // To change border position, we first draw the path and then
    // set it as the clip path. Then, increase the paint size by
    // 2x to compensate for the part of the path that gets cut out
    //
    // See: https://groups.google.com/g/skia-discuss/c/fE7qzKejMng
    switch (border.position) {
      case Sketch.BorderPosition.Outside:
        paint.setStrokeWidth(border.thickness * 2);
        canvas.clipPath(path, CanvasKit.ClipOp.Difference, true);
        break;
      case Sketch.BorderPosition.Center:
        break;
      case Sketch.BorderPosition.Inside:
        paint.setStrokeWidth(border.thickness * 2);
        canvas.clipPath(path, CanvasKit.ClipOp.Intersect, true);
        break;
    }

    canvas.drawPath(path, paint);
    canvas.restore();
  });
}

const init: typeof CanvasKitInit = require('canvaskit-wasm/bin/canvaskit.js');

export function load() {
  return init({
    locateFile: (file: string) =>
      'https://unpkg.com/canvaskit-wasm@^0.22.0/bin/' + file,
  });
}
