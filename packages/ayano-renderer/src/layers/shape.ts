import Sketch from '@sketch-hq/sketch-file-format-ts';
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

// We roughly follow Skia's SVG renderer for opacity rendering.
// https://github.com/google/skia/blob/f326e4faef66d529904a7b53eb931fd576c82887/modules/svg/src/SkSVGRenderContext.cpp#L444
export function renderShape(
  context: Context,
  layer: Sketch.Rectangle | Sketch.Oval,
) {
  const { canvas, CanvasKit } = context;

  const path = Primitives.path(CanvasKit, layer.points, layer.frame);

  path.setFillType(CanvasKit.FillType.EvenOdd);

  if (!layer.style) return;

  const matrix = getGradientTransformationMatrix(context, layer.frame);

  const contextSettings = layer.style.contextSettings ?? { opacity: 1 };
  const fills = (layer.style.fills ?? []).slice().reverse();
  const borders = (layer.style.borders ?? []).slice().reverse();

  const hasFill = fills.length > 0;
  const hasBorder = borders.length > 0;

  // Rendering into a layer is expensive, so if we have *either* a stroke
  // or fill, combine opacity with fill or border paint.
  const useLayer = contextSettings.opacity < 1 && hasFill && hasBorder;

  const saveCount = canvas.getSaveCount();

  if (useLayer) {
    const opacityPaint = new CanvasKit.Paint();
    opacityPaint.setAlphaf(contextSettings.opacity);

    canvas.saveLayer(opacityPaint);
  }

  fills.forEach((fill) => {
    if (!fill.isEnabled) return;

    const paint = Primitives.fill(CanvasKit, fill, matrix);

    if (!useLayer) {
      paint.setAlphaf(contextSettings.opacity);
    }

    canvas.drawPath(path, paint);
  });

  borders.forEach((border) => {
    if (!border.isEnabled || border.thickness === 0) return;

    const paint = Primitives.border(CanvasKit, border);

    if (!useLayer) {
      paint.setAlphaf(contextSettings.opacity);
    }

    renderBorderPath(context, paint, path, border.position);
  });

  canvas.restoreToCount(saveCount);
}
