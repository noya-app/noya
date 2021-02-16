import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Rect } from 'ayano-state';
import type { Paint } from 'canvaskit-wasm';
import { Context } from '../context';
import * as Primitives from '../primitives';

export function getBoundingRect(
  layer: Sketch.AnyLayer,
  layerIds: string[],
): Rect | undefined {
  let bounds = { minX: Infinity, minY: Infinity, maxX: 0, maxY: 0 };
  let translate = { x: 0, y: 0 };

  function inner(layer: Sketch.AnyLayer) {
    switch (layer._class) {
      case 'artboard':
      case 'bitmap':
      case 'rectangle':
      case 'oval':
      case 'text': {
        if (!layerIds.includes(layer.do_objectID)) break;

        const x = layer.frame.x + translate.x + 0.5;
        const y = layer.frame.y + translate.y + 0.5;
        const width = layer.frame.width - 1;
        const height = layer.frame.height - 1;

        bounds.minX = Math.min(x, bounds.minX);
        bounds.minY = Math.min(y, bounds.minY);
        bounds.maxX = Math.max(x + width, bounds.maxX);
        bounds.maxY = Math.max(y + height, bounds.maxY);

        break;
      }
      default:
        break;
    }

    switch (layer._class) {
      case 'page':
      case 'artboard': {
        translate.x += layer.frame.x;
        translate.y += layer.frame.y;

        layer.layers.forEach(inner);

        translate.x -= layer.frame.x;
        translate.y -= layer.frame.y;

        break;
      }
      default:
        break;
    }
  }

  inner(layer);

  // Check that at least one layer had a non-zero size
  if (!isFinite(bounds.minX) || !isFinite(bounds.minY)) return undefined;

  return {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  };
}

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
