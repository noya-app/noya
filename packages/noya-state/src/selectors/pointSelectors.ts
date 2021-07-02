import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit } from 'canvaskit';
import { Draft } from 'immer';
import { distance, Point, Rect } from 'noya-geometry';
import {
  decodeCurvePoint,
  DecodedCurvePoint,
  encodeCurvePoint,
  path,
} from 'noya-renderer/src/primitives';
import { IndexPath } from 'tree-visit';
import {
  ApplicationState,
  InteractionState,
  Layers,
  SelectedPointLists,
} from '../index';
import { PointsLayer, visit } from '../layers';
import { SelectedControlPoint } from '../reducers/applicationReducer';
import { SetNumberMode } from '../reducers/styleReducer';
import { getCurrentPage } from './pageSelectors';
import { getBoundingRectMap } from './selectors';

export const POINT_RADIUS = 4;

export const isPointInRange = (point: Point, rawPoint: Point): boolean => {
  return distance(point, rawPoint) < POINT_RADIUS;
};

export const computeNewBoundingRect = (
  CanvasKit: CanvasKit,
  decodedPoints: DecodedCurvePoint[],
  layer: PointsLayer,
) => {
  const [minX, minY, maxX, maxY] = path(
    CanvasKit,
    decodedPoints.map((decodedCurvePoint) =>
      encodeCurvePoint(decodedCurvePoint, layer.frame),
    ),
    layer.frame,
    layer.isClosed,
  ).computeTightBounds();

  const newRect: Rect = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };

  return newRect;
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

export const getIsEditingPath = (type: InteractionState['type']): boolean => {
  return (
    type === 'editPath' ||
    type === 'maybeMovePoint' ||
    type === 'movingPoint' ||
    type === 'maybeMoveControlPoint' ||
    type === 'movingControlPoint'
  );
};

export const moveSelectedPoints = (
  selectedPointLists: SelectedPointLists,
  layerIndexPaths: IndexPath[],
  delta: Partial<Point>,
  mode: SetNumberMode,
  draftPage: Draft<Sketch.Page>,
  pageSnapshot: Sketch.Page,
  CanvasKit: CanvasKit,
) => {
  const boundingRects = getBoundingRectMap(
    pageSnapshot,
    Object.keys(selectedPointLists),
    {
      clickThroughGroups: true,
      includeArtboardLayers: false,
      includeHiddenLayers: false,
    },
  );

  layerIndexPaths.forEach((indexPath) => {
    const layer = Layers.access(pageSnapshot, indexPath);
    const pointList = selectedPointLists[layer.do_objectID];
    const boundingRect = boundingRects[layer.do_objectID];

    if (!Layers.isPointsLayer(layer) || !boundingRect) return;

    // Update all points by first transforming to the canvas's coordinate system
    const decodedPoints = layer.points
      .map((curvePoint) => decodeCurvePoint(curvePoint, boundingRect))
      .map((decodedPoint, index) => {
        if (!pointList.includes(index)) return decodedPoint;

        (['point', 'curveFrom', 'curveTo'] as const).forEach((key) => {
          decodedPoint[key] = {
            x:
              delta.x === undefined
                ? decodedPoint[key].x
                : mode === 'replace'
                ? delta.x
                : decodedPoint[key].x + delta.x,
            y:
              delta.y === undefined
                ? decodedPoint[key].y
                : mode === 'replace'
                ? delta.y
                : decodedPoint[key].y + delta.y,
          };
        });

        return decodedPoint;
      });

    const draftLayer = Layers.access(draftPage, indexPath) as PointsLayer;

    draftLayer.frame = {
      ...layer.frame,
      ...computeNewBoundingRect(CanvasKit, decodedPoints, layer),
    };

    // Transform back to the range [0, 1], using the new bounds
    draftLayer.points = decodedPoints.map((decodedCurvePoint) =>
      encodeCurvePoint(decodedCurvePoint, draftLayer.frame),
    );
  });
};

export const moveControlPoints = (
  selectedPointLists: SelectedControlPoint,
  layerIndexPaths: IndexPath[],
  delta: Partial<Point>,
  mode: SetNumberMode,
  draftPage: Draft<Sketch.Page>,
  pageSnapshot: Sketch.Page,
  CanvasKit: CanvasKit,
) => {
  const { layerId, pointIndex, controlPointType } = selectedPointLists;

  const boundingRects = getBoundingRectMap(pageSnapshot, [layerId], {
    clickThroughGroups: true,
    includeArtboardLayers: false,
    includeHiddenLayers: false,
  });

  layerIndexPaths.forEach((indexPath) => {
    const layer = Layers.access(pageSnapshot, indexPath);
    const boundingRect = boundingRects[layer.do_objectID];

    if (!Layers.isPointsLayer(layer) || !boundingRect) return;

    const curveMode = layer.points[pointIndex].curveMode;

    // Update all points by first transforming to the canvas's coordinate system
    const decodedPoints = layer.points.map((curvePoint) =>
      decodeCurvePoint(curvePoint, boundingRect),
    );

    const decodedPoint = decodedPoints[pointIndex];

    const oppositeControlPointType =
      controlPointType === 'curveFrom' ? 'curveTo' : 'curveFrom';

    const controlPoint = decodedPoint[controlPointType];
    const oppositeControlPoint = decodedPoint[oppositeControlPointType];

    const selectedControlPointValueX = delta.x
      ? controlPoint.x + delta.x
      : controlPoint.x;
    const selectedControlPointValueY = delta.y
      ? controlPoint.y + delta.y
      : controlPoint.y;

    const deltaX = controlPoint.x - selectedControlPointValueX;
    const deltaY = controlPoint.y - selectedControlPointValueY;

    const oppositeControlPointDistance = distance(
      decodedPoint.point,
      oppositeControlPoint,
    );

    switch (curveMode) {
      case Sketch.CurveMode.Mirrored:
        controlPoint.x = selectedControlPointValueX;
        controlPoint.y = selectedControlPointValueY;

        oppositeControlPoint.x += deltaX;
        oppositeControlPoint.y += deltaY;
        break;
      case Sketch.CurveMode.Asymmetric:
        controlPoint.x = selectedControlPointValueX;
        controlPoint.y = selectedControlPointValueY;

        let theta =
          Math.atan2(
            controlPoint.y - decodedPoint.point.y,
            controlPoint.x - decodedPoint.point.x,
          ) + Math.PI;

        const oppositeControlPointValue = {
          x:
            oppositeControlPointDistance * Math.cos(theta) +
            decodedPoint.point.x,
          y:
            oppositeControlPointDistance * Math.sin(theta) +
            decodedPoint.point.y,
        };

        decodedPoint[oppositeControlPointType] = oppositeControlPointValue;
        break;
      default:
        controlPoint.x = selectedControlPointValueX;
        controlPoint.y = selectedControlPointValueY;
    }

    const draftLayer = Layers.access(draftPage, indexPath) as PointsLayer;

    draftLayer.frame = {
      ...layer.frame,
      ...computeNewBoundingRect(CanvasKit, decodedPoints, layer),
    };

    // Transform back to the range [0, 1], using the new bounds
    draftLayer.points = decodedPoints.map((decodedCurvePoint) =>
      encodeCurvePoint(decodedCurvePoint, draftLayer.frame),
    );
  });
};
