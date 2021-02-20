import Sketch from '@sketch-hq/sketch-file-format-ts';
import { FontMgr } from 'canvaskit-wasm';
import { Context } from '../context';
import { renderBitmap } from '../layers/bitmap';
import { renderShape } from '../layers/shape';
import { renderText } from '../layers/text';
import { renderArtboard } from './artboard';

// We roughly follow Skia's SVG renderer for opacity rendering.
// Note: there are more optimizations that can be done here - we don't
// need to allocate a separate layer in certain circumstances
// (e.g. for a shape with only a stroke OR fill but not both)
// https://github.com/google/skia/blob/f326e4faef66d529904a7b53eb931fd576c82887/modules/svg/src/SkSVGRenderContext.cpp#L444
export function renderLayer(
  context: Context,
  fontManager: FontMgr,
  layer: Sketch.AnyLayer,
) {
  const { CanvasKit, canvas } = context;

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  const saveCount = canvas.getSaveCount();

  if (opacity < 1) {
    const opacityPaint = new CanvasKit.Paint();
    opacityPaint.setAlphaf(opacity);

    canvas.saveLayer(opacityPaint);
  }

  switch (layer._class) {
    case 'artboard':
      renderArtboard(context, fontManager, layer);
      break;
    case 'text':
      renderText(context, fontManager, layer);
      break;
    case 'bitmap':
      renderBitmap(context, layer);
      break;
    case 'rectangle':
    case 'oval':
      renderShape(context, layer);
      break;
    default:
      console.log(layer._class, 'not handled');
      break;
  }

  canvas.restoreToCount(saveCount);
}
