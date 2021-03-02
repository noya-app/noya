import Sketch from '@sketch-hq/sketch-file-format-ts';
import { getLayerFixedRadius } from 'noya-state/src/selectors';
import { PathEffect } from 'canvaskit-wasm';
import { Context } from '../context';
import * as Primitives from '../primitives';
import { renderBorderPath } from '../styles/border';

/**
 * CanvasKit draws gradients in absolute coordinates, while Sketch draws them
 * relative to the layer's frame. This function returns a matrix that converts
 * absolute coordinates into the range (0, 1).
 */
function getGradientTransformationMatrix(
  context: Context,
  rect: Sketch.Rect,
): number[] {
  const { CanvasKit } = context;

  return CanvasKit.Matrix.multiply(
    CanvasKit.Matrix.translated(rect.x, rect.y),
    CanvasKit.Matrix.scaled(rect.width, rect.height),
  );
}

export function renderShape(
  context: Context,
  layer: Sketch.Rectangle | Sketch.Oval,
) {
  const { canvas, CanvasKit } = context;

  const path = Primitives.path(
    CanvasKit,
    layer.points,
    layer.frame,
    getLayerFixedRadius(layer),
  );

  path.setFillType(CanvasKit.FillType.EvenOdd);

  if (!layer.style) return;

  const matrix = getGradientTransformationMatrix(context, layer.frame);

  const fills = (layer.style.fills ?? []).slice().reverse();
  const borders = (layer.style.borders ?? []).slice().reverse();

  fills.forEach((fill) => {
    if (!fill.isEnabled) return;

    const paint = Primitives.fill(CanvasKit, fill, matrix);

    canvas.drawPath(path, paint);
  });

  borders.forEach((border) => {
    if (!border.isEnabled || border.thickness === 0) return;

    const paint = Primitives.border(CanvasKit, border);

    renderBorderPath(context, paint, path, border.position);
  });
}
