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

export function drawLayerShape(
  context: Context,
  layer: Sketch.Rectangle | Sketch.Oval,
) {
  const { canvas, CanvasKit } = context;

  const fill = layer.style?.fills?.[0];

  if (!fill) return;

  const path = Primitives.path(CanvasKit, layer.points, layer.frame);

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
