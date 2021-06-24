import { distance, Point } from 'noya-geometry';
import {
  decodeCurvePoint,
  DecodedCurvePoint,
} from 'noya-renderer/src/primitives';
import { ApplicationState, Layers } from '../index';
import { visit } from '../layers';
import { getCurrentPage } from './pageSelectors';
import { getBoundingRectMap } from './selectors';

export const POINT_RADIUS = 4;

export const isPointInRange = (point: Point, rawPoint: Point): boolean => {
  return distance(point, rawPoint) < POINT_RADIUS;
};

const getSelectedPointsFromPointLists = (
  state: ApplicationState,
  pointLists: Record<string, number[]>,
): DecodedCurvePoint[] => {
  const page = getCurrentPage(state);
  const boundingRects = getBoundingRectMap(
    getCurrentPage(state),
    Object.keys(pointLists),
    {
      clickThroughGroups: true,
      includeArtboardLayers: false,
      includeHiddenLayers: false,
    },
  );

  const points: DecodedCurvePoint[] = [];

  visit(page, (layer) => {
    const boundingRect = boundingRects[layer.do_objectID];
    const pointList = pointLists[layer.do_objectID];

    if (
      !boundingRect ||
      !pointList ||
      pointList.length === 0 ||
      !Layers.isPointsLayer(layer)
    )
      return;

    const selectedPoints = layer.points.filter((_, index) =>
      pointList.includes(index),
    );

    if (selectedPoints.length === 0) return;

    const decodedPoints = selectedPoints.map((point) =>
      decodeCurvePoint(point, boundingRect),
    );

    points.push(...decodedPoints);
  });

  return points;
};

export const getSelectedPoints = (
  state: ApplicationState,
): DecodedCurvePoint[] => {
  const selectedPoints = getSelectedPointsFromPointLists(
    state,
    state.selectedPointLists,
  );
  return selectedPoints;
};

export const getSelectedControlPoint = (
  state: ApplicationState,
): DecodedCurvePoint | undefined => {
  if (!state.selectedControlPoint) {
    return undefined;
  }

  const controlPoints = getSelectedPointsFromPointLists(state, {
    [state.selectedControlPoint.layerId]: [
      state.selectedControlPoint.pointIndex,
    ],
  });

  return controlPoints.length > 0 ? controlPoints[0] : undefined;
};
