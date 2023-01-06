import Sketch from 'noya-file-format';
import { AffineTransform, createBounds, Point, Rect } from 'noya-geometry';
import {
  CompassDirection,
  compassDirections,
  decodeCurvePoint,
  DragHandle,
  getSelectedLineLayer,
  InteractionState,
} from 'noya-state';
import type { ApplicationState } from './reducers/applicationReducer';

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
export const dragHandleSize = 7;

export function getRectDragHandles(
  boundingRect: Rect,
  zoom: number,
): DragHandle[] {
  const handleSize = dragHandleSize / zoom;

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

export function getLineDragHandleDirectionForIndex(index: number): 'n' | 's' {
  return index === 0 ? 's' : 'n';
}

export function getLineDragHandleIndexForDirection(
  direction: CompassDirection,
) {
  return direction === 's' ? 0 : 1;
}

export function getLineDragHandles(
  boundingRect: Rect,
  points: Sketch.CurvePoint[],
  isFlippedHorizontal: boolean,
  isFlippedVertical: boolean,
  zoom: number,
): DragHandle[] {
  const bounds = createBounds(boundingRect);

  // Get the flip transform, since the bounding rect doesn't take flip into account
  const transform = AffineTransform.multiply(
    AffineTransform.translate(bounds.midX, bounds.midY),
    AffineTransform.scale(
      isFlippedHorizontal ? -1 : 1,
      isFlippedVertical ? -1 : 1,
    ),
    AffineTransform.translate(-bounds.midX, -bounds.midY),
  );

  const handleSize = dragHandleSize / zoom;

  return points
    .map((point) => decodeCurvePoint(point, boundingRect))
    .map((decodedPoint, index) => {
      const transformedPoint = transform.applyTo(decodedPoint.point);

      return {
        rect: {
          x: transformedPoint.x - handleSize / 2,
          y: transformedPoint.y - handleSize / 2,
          width: handleSize,
          height: handleSize,
        },
        compassDirection: getLineDragHandleDirectionForIndex(index),
      };
    });
}

export function getDragHandles(
  state: ApplicationState,
  rect: Rect,
  zoom: number,
) {
  const lineLayer = getSelectedLineLayer(state);

  return lineLayer
    ? getLineDragHandles(
        rect,
        lineLayer.points,
        lineLayer.isFlippedHorizontal,
        lineLayer.isFlippedVertical,
        zoom,
      )
    : getRectDragHandles(rect, zoom);
}

export function getCurrentHandleDirection(interactionState: InteractionState) {
  return interactionState.type === 'hoverHandle' ||
    interactionState.type === 'maybeScale' ||
    interactionState.type === 'scaling'
    ? interactionState.direction
    : undefined;
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

const oppositeDirectionMap: Record<CompassDirection, CompassDirection> = {
  n: 's',
  ne: 'sw',
  e: 'w',
  se: 'nw',
  s: 'n',
  sw: 'ne',
  w: 'e',
  nw: 'se',
};

export function getOppositeDirection(direction: CompassDirection) {
  return oppositeDirectionMap[direction];
}
