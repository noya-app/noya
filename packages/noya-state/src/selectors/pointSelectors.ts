import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit, Path } from 'canvaskit';
import { Draft } from 'immer';
import { distance, Point, Rect } from 'noya-geometry';
import { PointString } from 'noya-sketch-model';
import {
  decodeCurvePoint,
  DecodedCurvePoint,
  encodeCurvePoint,
  parsePoint,
  path,
  Primitives,
  stringifyPoint,
} from 'noya-state';
import { range, windowsOf } from 'noya-utils';
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
export const SELECTED_GRADIENT_POINT_RADIUS = POINT_RADIUS * 2;

export const isPointInRange = (
  point: Point,
  rawPoint: Point,
  pointRadius = POINT_RADIUS,
): boolean => {
  return distance(point, rawPoint) < pointRadius;
};

export function isLine(points: Sketch.CurvePoint[]) {
  return (
    points.length === 2 &&
    points.every((point) => point.curveMode === Sketch.CurveMode.Straight)
  );
}

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
    { clickThroughGroups: true },
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

export const getDistanceAlongPath = (
  CanvasKit: CanvasKit,
  path: Path,
  point: Point,
): { t: number; pointOnPath: Point } | undefined => {
  const measureIter = new CanvasKit.ContourMeasureIter(path, false, 1);

  const contour = measureIter.next();

  if (!contour) return;

  const length = contour.length();

  // TODO: Consider alternatives (is this enough granularity?)
  const steps = Math.min(Math.ceil(length), 500);

  const sorted = range(0, steps)
    .map((i) => {
      const t = i / steps;
      const percentageLength = length * t;
      const [x, y] = contour.getPosTan(percentageLength);
      const pointOnPath = { x, y };

      return { t, pointOnPath, distance: distance(point, pointOnPath) };
    })
    .sort((a, b) => a.distance - b.distance);

  const smallest = sorted[0];

  if (!smallest || smallest.distance > CLICKABLE_PATH_WIDTH) return;

  return { t: smallest.t, pointOnPath: smallest.pointOnPath };
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

export const getCurvePointForSelectedControlPoint = (
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

type PointIndexPath = {
  indexPath: IndexPath;
  pointIndex: number;
};

export function getIndexPathOfOpenShapeLayer(
  state: ApplicationState,
): PointIndexPath | undefined {
  // If multiple points are selected, we don't allow adding points to the path
  if (
    Object.values(state.selectedPointLists).flat().length !== 1 &&
    !state.selectedControlPoint
  )
    return;

  const [layerId, pointIndex] = (() => {
    if (state.selectedControlPoint) {
      return [
        state.selectedControlPoint.layerId,
        state.selectedControlPoint.pointIndex,
      ] as const;
    }

    // Find the selected [layerId, [pointIndex]] pair
    const selectedPairs = Object.entries(state.selectedPointLists).filter(
      ([_, value]) => value.length > 0,
    );

    const [[layerId, [pointIndex]]] = selectedPairs;
    return [layerId, pointIndex] as const;
  })();

  const page = getCurrentPage(state);

  const indexPath = Layers.findIndexPath(
    page,
    (layer) => layer.do_objectID === layerId,
  );

  if (!indexPath) return;

  const layer = Layers.access(page, indexPath);

  if (
    !!layer &&
    Layers.isPointsLayer(layer) &&
    !layer.isClosed &&
    // We can only add points if the first or last point is seleted
    (pointIndex === 0 || pointIndex === layer.points.length - 1)
  ) {
    return { indexPath, pointIndex };
  }
}

export const getIsEditingPath = (type: InteractionState['type']): boolean => {
  return (
    type === 'editPath' ||
    type === 'maybeMovePoint' ||
    type === 'movingPoint' ||
    type === 'maybeMoveControlPoint' ||
    type === 'movingControlPoint' ||
    type === 'maybeConvertCurveMode'
  );
};

function getNewValue(value: number, mode: SetNumberMode, delta?: number) {
  return delta === undefined
    ? value
    : mode === 'replace'
    ? delta
    : value + delta;
}

export const moveSelectedPoints = (
  selectedPointLists: SelectedPointLists,
  layerIndexPaths: IndexPath[],
  delta: Partial<Point>,
  mode: SetNumberMode,
  draftPage: Draft<Sketch.Page>,
  pageSnapshot: Sketch.Page,
  CanvasKit: CanvasKit,
) => {
  layerIndexPaths.forEach((indexPath) => {
    const layer = Layers.access(pageSnapshot, indexPath);

    if (!Layers.isPointsLayer(layer)) return;

    // We handle dragging a single point by adjusting the layer's frame directly.
    // The position of points within the layer's frame isn't meaningful when there's
    // only one point, so we don't need to change the point itself.
    if (layer.points.length === 1) {
      const draftLayer = Layers.access(draftPage, indexPath) as PointsLayer;

      draftLayer.frame = {
        ...layer.frame,
        x: getNewValue(layer.frame.x, mode, delta.x),
        y: getNewValue(layer.frame.y, mode, delta.y),
      };

      return;
    }

    const pointList = selectedPointLists[layer.do_objectID];

    // Update all points by first transforming to the canvas's coordinate system
    const decodedPoints = layer.points
      .map((curvePoint) => decodeCurvePoint(curvePoint, layer.frame))
      .map((decodedPoint, index) => {
        if (!pointList.includes(index)) return decodedPoint;

        (['point', 'curveFrom', 'curveTo'] as const).forEach((key) => {
          decodedPoint[key] = {
            x: getNewValue(decodedPoint[key].x, mode, delta.x),
            y: getNewValue(decodedPoint[key].y, mode, delta.y),
          };
        });

        return decodedPoint;
      });

    const draftLayer = Layers.access(draftPage, indexPath) as PointsLayer;

    draftLayer.frame = {
      ...layer.frame,
      ...computeNewBoundingRect(CanvasKit, decodedPoints, layer),
    };

    fixZeroLayerDimensions(draftLayer);

    // Transform back to the range [0, 1], using the new bounds
    draftLayer.points = decodedPoints.map((decodedCurvePoint) =>
      encodeCurvePoint(decodedCurvePoint, draftLayer.frame),
    );
  });
};

export const fixZeroLayerDimensions = (layer: PointsLayer) => {
  if (layer.frame.height === 0) {
    layer.frame.height = 1;
    layer.points.forEach((point) => {
      (['point', 'curveFrom', 'curveTo'] as const).forEach((key) => {
        point[key] = PointString.encode({
          x: PointString.decode(point[key]).x,
          y: 0.5,
        });
      });
    });
    layer.frame.y -= 0.5;
  }

  if (layer.frame.width === 0) {
    layer.frame.width = 1;
    layer.points.forEach((point) => {
      (['point', 'curveFrom', 'curveTo'] as const).forEach((key) => {
        point[key] = PointString.encode({
          x: 0.5,
          y: PointString.decode(point[key]).y,
        });
      });
    });
    layer.frame.x -= 0.5;
  }
};

export const moveControlPoints = (
  selectedControlPoint: SelectedControlPoint,
  indexPath: IndexPath,
  delta: Partial<Point>,
  mode: SetNumberMode,
  draftPage: Draft<Sketch.Page>,
  pageSnapshot: Sketch.Page,
  CanvasKit: CanvasKit,
) => {
  const { pointIndex, controlPointType } = selectedControlPoint;

  const layer = Layers.access(pageSnapshot, indexPath);

  if (!Layers.isPointsLayer(layer)) return;

  // We handle a single point specially
  if (layer.points.length === 1) {
    const draftLayer = Layers.access(draftPage, indexPath) as PointsLayer;

    const curveFrom = parsePoint(layer.points[0].curveFrom);
    const curveTo = parsePoint(layer.points[0].curveTo);

    const inverseDelta = {
      x: delta.x !== undefined ? delta.x * -1 : undefined,
      y: delta.y !== undefined ? delta.y * -1 : undefined,
    };

    draftLayer.points[0].curveTo = stringifyPoint({
      x: getNewValue(curveTo.x, mode, delta.x),
      y: getNewValue(curveTo.y, mode, delta.y),
    });

    draftLayer.points[0].curveFrom = stringifyPoint({
      x: getNewValue(curveFrom.x, mode, inverseDelta.x),
      y: getNewValue(curveFrom.y, mode, inverseDelta.y),
    });

    return;
  }

  const curveMode = layer.points[pointIndex].curveMode;

  // Update all points by first transforming to the canvas's coordinate system
  const decodedPoints = layer.points.map((curvePoint) =>
    decodeCurvePoint(curvePoint, layer.frame),
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
          oppositeControlPointDistance * Math.cos(theta) + decodedPoint.point.x,
        y:
          oppositeControlPointDistance * Math.sin(theta) + decodedPoint.point.y,
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
};

const CLICKABLE_PATH_WIDTH = 3;

export function layerPathContainsPoint(
  CanvasKit: CanvasKit,
  layer: PointsLayer,
  point: Point,
): boolean {
  return (
    Primitives.path(CanvasKit, layer.points, layer.frame, layer.isClosed)
      .stroke({ width: CLICKABLE_PATH_WIDTH })
      ?.contains(point.x, point.y) ?? false
  );
}

export function findIndexOfPathSegmentContainingPoint(
  CanvasKit: CanvasKit,
  layer: PointsLayer,
  point: Point,
): number | undefined {
  const segments = windowsOf(layer.points, 2, layer.isClosed);

  const segmentPaths = segments.map((segment) =>
    Primitives.path(CanvasKit, segment, layer.frame, false),
  );

  const segmentIndex = segmentPaths.findIndex((path) =>
    path.stroke({ width: CLICKABLE_PATH_WIDTH })?.contains(point.x, point.y),
  );

  return segmentIndex >= 0 ? segmentIndex : undefined;
}

export function getPathSegment(
  CanvasKit: CanvasKit,
  layer: PointsLayer,
  segmentIndex: number,
): Path | undefined {
  const segments = windowsOf(layer.points, 2, layer.isClosed);

  return Primitives.path(CanvasKit, segments[segmentIndex], layer.frame, false);
}

export function getSplitPathParameters(
  CanvasKit: CanvasKit,
  layer: PointsLayer,
  point: Point,
) {
  const segmentIndex = findIndexOfPathSegmentContainingPoint(
    CanvasKit,
    layer,
    point,
  );

  if (segmentIndex === undefined) return;

  const segmentPath = getPathSegment(CanvasKit, layer, segmentIndex);

  if (!segmentPath) return;

  const pointDistance = getDistanceAlongPath(CanvasKit, segmentPath, point);

  if (!pointDistance) return;

  return {
    segmentIndex,
    segmentPath,
    t: pointDistance.t,
    pointOnPath: pointDistance.pointOnPath,
  };
}
