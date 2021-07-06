import { Point } from 'noya-geometry';
import { decodeCurvePoint } from 'noya-renderer/src/primitives';
import { ApplicationState, Layers } from '../index';
import { SelectedControlPoint } from '../reducers/applicationReducer';
import { SelectedPoint } from '../reducers/pointReducer';
import { getCurrentPage } from './pageSelectors';
import {
  getBoundingRectMap,
  getIndexPathOfOpenShapeLayer,
  isPointInRange,
} from './selectors';
import { getSelectedLayers } from 'noya-state/src/selectors/layerSelectors';

type PathElement =
  | {
      type: 'point';
      value: SelectedPoint;
    }
  | {
      type: 'controlPoint';
      value: SelectedControlPoint;
    };

export function canClosePath(state: ApplicationState, element: PathElement) {
  if (element.type === 'point') {
    const [layerId, index] = element.value;

    const layers = getSelectedLayers(state)
      .filter(Layers.isPointsLayer)
      .filter((layer) => layer.do_objectID === layerId);

    return (
      (index === layers[0].points.length - 1 || index === 0) &&
      !layers[0].isClosed &&
      !state.selectedPointLists[layerId].includes(index)
    );
  }
  return false;
}

export const getCursorForEditPathMode = (
  state: ApplicationState,
  point: Point,
) => {
  const elementAtPoint = getPathElementAtPoint(state, point);
  if (elementAtPoint) {
    return canClosePath(state, elementAtPoint) ? 'no-drop' : 'move';
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
