import { Point } from 'noya-geometry';
import { decodeCurvePoint } from 'noya-state';
import { ApplicationState, Layers } from '../index';
import { SelectedControlPoint } from '../reducers/applicationReducer';
import { SelectedPoint } from '../reducers/pointReducer';
import { getCurrentPage } from './pageSelectors';
import {
  getBoundingRectMap,
  getIndexPathOfOpenShapeLayer,
  isPointInRange,
  getSelectedLayers,
} from './selectors';

type PathElement =
  | {
      type: 'point';
      value: SelectedPoint;
    }
  | {
      type: 'controlPoint';
      value: SelectedControlPoint;
    };

export function canClosePath(state: ApplicationState, element: SelectedPoint) {
  if (state.keyModifiers.shiftKey) return false;

  const [layerId, index] = element;

  const layer = Layers.find(
    getCurrentPage(state),
    (layer) => layer.do_objectID === layerId,
  );

  if (!layer || !Layers.isPointsLayer(layer)) return false;

  // A path needs at least 2 points to be closed.
  // TODO: Don't allow closing a straight line segment with 2 points.
  if (layer.points.length < 2) return false;

  const selectedPoint = getIndexPathOfOpenShapeLayer(state);

  if (!selectedPoint) return false;

  const lastIndex = layer.points.length - 1;

  return (
    (index === lastIndex && selectedPoint.pointIndex === 0) ||
    (index === 0 && selectedPoint.pointIndex === lastIndex)
  );
}

export const getCursorForEditPathMode = (
  state: ApplicationState,
  point: Point,
) => {
  const elementAtPoint = getPathElementAtPoint(state, point);
  if (elementAtPoint) {
    return elementAtPoint.type === 'point' &&
      canClosePath(state, elementAtPoint.value)
      ? 'pointer'
      : 'move';
  } else if (getIndexPathOfOpenShapeLayer(state)) {
    return 'crosshair';
  } else {
    return 'default';
  }
};

export function getPathElementAtPoint(
  state: ApplicationState,
  point: Point,
): PathElement | undefined {
  let selectedPoint: SelectedPoint | undefined = undefined;
  let selectedControlPoint: SelectedControlPoint | undefined;

  const boundingRects = getBoundingRectMap(
    getCurrentPage(state),
    state.selectedObjects,
    {
      clickThroughGroups: true,
      includeArtboardLayers: false,
      includeHiddenLayers: false,
    },
  );

  getSelectedLayers(state)
    .filter(Layers.isPointsLayer)
    .forEach((layer) => {
      const boundingRect = boundingRects[layer.do_objectID];
      layer.points.forEach((curvePoint, index) => {
        const decodedPoint = decodeCurvePoint(curvePoint, boundingRect);

        if (isPointInRange(decodedPoint.point, point)) {
          selectedPoint = [layer.do_objectID, index];
        } else if (isPointInRange(decodedPoint.curveTo, point)) {
          selectedControlPoint = {
            layerId: layer.do_objectID,
            pointIndex: index,
            controlPointType: 'curveTo',
          };
        } else if (isPointInRange(decodedPoint.curveFrom, point)) {
          selectedControlPoint = {
            layerId: layer.do_objectID,
            pointIndex: index,
            controlPointType: 'curveFrom',
          };
        }
      });
    });
  if (selectedPoint) {
    return { type: 'point', value: selectedPoint };
  } else if (selectedControlPoint) {
    return { type: 'controlPoint', value: selectedControlPoint };
  } else {
    return undefined;
  }
}
