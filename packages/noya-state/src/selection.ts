import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Point, Rect } from 'noya-geometry';
import {
  CompassDirection,
  compassDirections,
  decodeCurvePoint,
  DragHandle,
  Selectors,
} from 'noya-state';

export const compassDirectionMap: Record<CompassDirection, Point> = {
  n: { x: 0.5, y: 0 },
  ne: { x: 1, y: 0 },
  e: { x: 1, y: 0.5 },
  se: { x: 1, y: 1 },
  s: { x: 0.5, y: 1 },
  sw: { x: 0, y: 1 },
  w: { x: 0, y: 0.5 },
  nw: { x: 0, y: 0 },
};
export const dragHandleSize: number = 7;

export function getRectDragHandles(
  boundingRect: Rect,
  handleSize: number = dragHandleSize,
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

export function getLineDragHandles(
  boundingRect: Rect,
  points: Sketch.CurvePoint[],
  layer: Sketch.AnyLayer,
  handleSize: number = dragHandleSize,
): DragHandle[] {
  const transform = Selectors.getLayerFlipTransform(layer);

  return points
    .map((point) => decodeCurvePoint(point, boundingRect))
    .map((decodedPoint) => {
      const transformedPoint = transform.applyTo(decodedPoint.point);

      return {
        rect: {
          x: transformedPoint.x - handleSize / 2,
          y: transformedPoint.y - handleSize / 2,
          width: handleSize,
          height: handleSize,
        },
        compassDirection: 'n',
      };
    });
}

// This function doesn't ensure a positive width/height, since we use it when
// scaling, which can result in a negative width/height.
export function getRectExtentPoint(rect: Rect, direction: CompassDirection) {
  const minX = rect.x;
  const minY = rect.y;
  const maxX = rect.x + rect.width;
  const maxY = rect.y + rect.height;
  const midX = (maxX + minX) / 2;
  const midY = (maxY + minY) / 2;

  const x = direction.includes('w')
    ? minX
    : direction.includes('e')
    ? maxX
    : midX;

  const y = direction.includes('n')
    ? minY
    : direction.includes('s')
    ? maxY
    : midY;

  return { x, y };
}
