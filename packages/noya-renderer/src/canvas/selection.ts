import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  CompassDirection,
  compassDirections,
  DragHandle,
  Point,
  Rect,
} from 'noya-state';
import { isParentLayer } from 'noya-state/src/layers';

export function getBoundingRect(
  layer: Sketch.AnyLayer,
  layerIds: string[],
): Rect | undefined {
  let bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  let translate = { x: 0, y: 0 };

  function inner(layer: Sketch.AnyLayer) {
    switch (layer._class) {
      case 'artboard':
      case 'bitmap':
      case 'group':
      case 'rectangle':
      case 'oval':
      case 'text': {
        if (!layerIds.includes(layer.do_objectID)) break;

        const frame = layer.frame;

        const x = frame.x + translate.x;
        const y = frame.y + translate.y;

        bounds.minX = Math.min(x, bounds.minX);
        bounds.minY = Math.min(y, bounds.minY);
        bounds.maxX = Math.max(x + frame.width, bounds.maxX);
        bounds.maxY = Math.max(y + frame.height, bounds.maxY);

        break;
      }
      default:
        break;
    }

    if (isParentLayer(layer)) {
      translate.x += layer.frame.x;
      translate.y += layer.frame.y;

      layer.layers.forEach(inner);

      translate.x -= layer.frame.x;
      translate.y -= layer.frame.y;
    }
  }

  inner(layer);

  // Check that at least one layer had a non-zero size
  if (!Object.values(bounds).every(isFinite)) return undefined;

  return {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  };
}

const compassDirectionMap: Record<CompassDirection, Point> = {
  n: { x: 0.5, y: 0 },
  ne: { x: 1, y: 0 },
  e: { x: 1, y: 0.5 },
  se: { x: 1, y: 1 },
  s: { x: 0.5, y: 1 },
  sw: { x: 0, y: 1 },
  w: { x: 0, y: 0.5 },
  nw: { x: 0, y: 0 },
};

export function getDragHandles(
  boundingRect: Rect,
  handleSize: number = 7,
): DragHandle[] {
  return compassDirections.map((compassDirection) => {
    const translationPercent = compassDirectionMap[compassDirection];

    return {
      rect: {
        x:
          boundingRect.x +
          boundingRect.width * translationPercent.x -
          handleSize / 2,
        y:
          boundingRect.y +
          boundingRect.height * translationPercent.y -
          handleSize / 2,
        width: handleSize,
        height: handleSize,
      },
      compassDirection,
    };
  });
}
