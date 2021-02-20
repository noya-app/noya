import Sketch from '@sketch-hq/sketch-file-format-ts';
import { isParentLayer } from 'ayano-state/src/layers';
import type { Paint } from 'canvaskit-wasm';
import { Context } from '../context';
import * as Primitives from '../primitives';

export function renderHoverOutline(
  context: Context,
  layer: Sketch.AnyLayer,
  paint: Paint,
  layerIds: string[],
) {
  const { CanvasKit, canvas } = context;

  switch (layer._class) {
    case 'artboard':
    case 'bitmap':
    case 'group':
    case 'text': {
      if (!layerIds.includes(layer.do_objectID)) break;

      canvas.drawRect(Primitives.rect(CanvasKit, layer.frame), paint);
      break;
    }
    case 'rectangle':
    case 'oval': {
      if (!layerIds.includes(layer.do_objectID)) break;

      const path = Primitives.path(CanvasKit, layer.points, layer.frame);
      path.setFillType(CanvasKit.FillType.EvenOdd);

      canvas.drawPath(path, paint);
      break;
    }
    default:
      console.log(layer._class, 'not handled');
      break;
  }

  if (isParentLayer(layer)) {
    canvas.save();
    canvas.translate(layer.frame.x, layer.frame.y);

    layer.layers.forEach((child) => {
      renderHoverOutline(context, child, paint, layerIds);
    });

    canvas.restore();
  }
}
