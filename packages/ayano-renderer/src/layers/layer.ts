import Sketch from '@sketch-hq/sketch-file-format-ts';
import { FontMgr } from 'canvaskit-wasm';
import { Context } from '../context';
import { renderBitmap } from '../layers/bitmap';
import { renderShape } from '../layers/shape';
import { renderText } from '../layers/text';
import { renderArtboard } from './artboard';

export function renderLayer(
  context: Context,
  fontManager: FontMgr,
  layer: Sketch.AnyLayer,
) {
  switch (layer._class) {
    case 'artboard':
      return renderArtboard(context, fontManager, layer);
    case 'text':
      return renderText(context, fontManager, layer);
    case 'bitmap':
      return renderBitmap(context, layer);
    case 'rectangle':
    case 'oval':
      return renderShape(context, layer);
    default:
      console.log(layer._class, 'not handled');
      return;
  }
}
