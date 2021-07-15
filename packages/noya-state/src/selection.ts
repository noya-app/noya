import { CurvePoint } from '@sketch-hq/sketch-file-format-ts/dist/cjs/types';
import {
  CompassDirection,
  compassDirections,
  decodeCurvePoint,
  DragHandle,
  Point,
  Rect,
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

export function getDragHandles(
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
  points: CurvePoint[],
  handleSize: number = dragHandleSize,
): DragHandle[] {
  const startDecodedPoint = decodeCurvePoint(points[0], boundingRect);
  const endDecodedPoint = decodeCurvePoint(points[1], boundingRect);

  return compassDirections
    .filter(
      (compassDirection) =>
        compassDirection === 'e' || compassDirection === 'w',
    )
    .map((compassDirection) => {
      const directionPoint =
        compassDirection === 'w' ? startDecodedPoint : endDecodedPoint;

      return {
        rect: {
          x: directionPoint.point.x - handleSize / 2,
          y: directionPoint.point.y - handleSize / 2,
          width: handleSize,
          height: handleSize,
        },
        compassDirection,
      };
    });
}
