import type Sketch from '@sketch-hq/sketch-file-format-ts';
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

  const path = Primitives.path(CanvasKit, layer.points, layer.frame);

  if (!layer.style) return;

  const fills = (layer.style.fills ?? []).slice().reverse();
  const borders = (layer.style.borders ?? []).slice().reverse();

  fills.forEach((fill) => {
    if (!fill.isEnabled) return;

    canvas.drawPath(path, Primitives.fill(CanvasKit, fill));
  });

  borders.forEach((border) => {
    if (!border.isEnabled || border.thickness === 0) return;

    canvas.drawPath(path, Primitives.border(CanvasKit, border));
  });
}

const init: typeof CanvasKitInit = require('canvaskit-wasm/bin/canvaskit.js');

export function load() {
  return init({
    locateFile: (file: string) =>
      'https://unpkg.com/canvaskit-wasm@^0.22.0/bin/' + file,
  });
}
