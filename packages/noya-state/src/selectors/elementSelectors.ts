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

export const getCursorForEditPathMode = (
  state: ApplicationState,
  point: Point,
) => {
  const element = getPathElementAtPoint(state, point);
  if (element) return 'move';
  if (getIndexPathOfOpenShapeLayer(state)) {
    return 'copy';
  }
  return 'default';
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
