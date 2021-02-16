import Sketch from '@sketch-hq/sketch-file-format-ts';
import type { Paint } from 'canvaskit-wasm';
import { Context } from '../context';
import * as Primitives from '../primitives';

export function renderSelectionOutline(
  context: Context,
  layer: Sketch.AnyLayer,
  paint: Paint,
  layerIds: string[],
) {
  const { CanvasKit, canvas } = context;

  switch (layer._class) {
    case 'artboard':
    case 'bitmap':
    case 'rectangle':
    case 'oval':
    case 'text': {
      if (!layerIds.includes(layer.do_objectID)) break;

      const frame = {
        ...layer.frame,
        x: layer.frame.x + 0.5,
        y: layer.frame.y + 0.5,
        width: layer.frame.width - 1,
        height: layer.frame.height - 1,
      };

      canvas.drawRect(Primitives.rect(CanvasKit, frame), paint);

      break;
    }
    default:
      break;
  }

  switch (layer._class) {
    case 'artboard': {
      canvas.save();
      canvas.translate(layer.frame.x, layer.frame.y);

      layer.layers.forEach((child) => {
        renderSelectionOutline(context, child, paint, layerIds);
      });

      canvas.restore();
      break;
    }
    default:
      break;
  }
}
