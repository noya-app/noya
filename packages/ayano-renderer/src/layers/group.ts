import Sketch from '@sketch-hq/sketch-file-format-ts';
import { FontMgr } from 'canvaskit-wasm';
import { Context } from '../context';
import { renderLayer } from './layer';

export function renderGroup(
  context: Context,
  fontManager: FontMgr,
  layer: Sketch.Group,
) {
  const { canvas } = context;

  canvas.save();
  canvas.translate(layer.frame.x, layer.frame.y);

  layer.layers.forEach((child) => {
    renderLayer(context, fontManager, child);
  });

  canvas.restore();
}
