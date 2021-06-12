import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { createRectFromBounds, Point } from 'noya-geometry';
import {
  decodeCurvePoint,
  encodeCurvePoint,
} from 'noya-renderer/src/primitives';
import * as Layers from '../layers';
import {
  getBoundingRectMap,
  getCurrentPage,
  getCurrentPageIndex,
  getSelectedLayerIndexPaths,
} from '../selectors/selectors';
import { ApplicationState, SetNumberMode } from './applicationReducer';

export type PointAction =
  | [type: 'setPointCurveMode', curveMode: Sketch.CurveMode]
  | [type: 'setPointCornerRadius', amount: number, mode?: SetNumberMode]
  | [type: 'setPointX' | 'setPointY', amount: number, mode?: SetNumberMode]
  | [type: 'selectPoint', point: Point, mode: SetNumberMode];

function isPointInRange(point: Point, rawPoint: Point): boolean {
  if (
    point.x >= rawPoint.x - 4 &&
    point.x <= rawPoint.x + 4 &&
    point.y >= rawPoint.y - 4 &&
    point.y <= rawPoint.y + 4
  ) {
    return true;
  }
  return false;
}

export function pointReducer(
  state: ApplicationState,
  action: PointAction,
): ApplicationState {
  switch (action[0]) {
    case 'setPointCurveMode': {
      const [, curveMode] = action;

      return visitSelectedDraftPoints(state, (curvePoint) => {
        curvePoint.curveMode = curveMode;
      });
    }
    case 'setPointCornerRadius': {
      const [, amount, mode] = action;

      return visitSelectedDraftPoints(state, (curvePoint) => {
        const newValue =
          mode === 'replace' ? amount : curvePoint.cornerRadius + amount;

        curvePoint.cornerRadius = Math.max(0, newValue);
      });
    }
    case 'selectPoint': {
      const [, rawPoint, mode] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);
      const boundingRects = getBoundingRectMap(
        getCurrentPage(state),
        Object.keys(state.selectedPointLists),
        {
          clickThroughGroups: true,
          includeArtboardLayers: false,
          includeHiddenLayers: false,
        },
      );

      return produce(state, (draft) => {
        layerIndexPaths.forEach((indexPath) => {
          const page = draft.sketch.pages[pageIndex];
          const layer = Layers.access(page, indexPath);
          const pointList = draft.selectedPointLists[layer.do_objectID];
          const boundingRect = boundingRects[layer.do_objectID];

          if (!Layers.isPointsLayer(layer) || !pointList) return;

          layer.points.forEach((point, index) => {
            const decodedPoint = decodeCurvePoint(point, boundingRect);
            if (isPointInRange(decodedPoint.point, rawPoint)) {
              if (pointList.indexOf(index) > -1) {
                pointList.splice(pointList.indexOf(index), 1);
              } else {
                mode === 'replace'
                  ? (draft.selectedPointLists = {
                      [layer.do_objectID]: [index],
                    })
                  : (draft.selectedPointLists = {
                      [layer.do_objectID]: [...pointList, index],
                    });
              }
            }
          });
        });
      });
    }
    case 'setPointX':
    case 'setPointY': {
      const [type, amount, mode] = action;
      const axis = type === 'setPointX' ? 'x' : 'y';

      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);
      const boundingRects = getBoundingRectMap(
        getCurrentPage(state),
        Object.keys(state.selectedPointLists),
        {
          clickThroughGroups: true,
          includeArtboardLayers: false,
          includeHiddenLayers: false,
        },
      );

      return produce(state, (draft) => {
        layerIndexPaths.forEach((indexPath) => {
          const page = draft.sketch.pages[pageIndex];
          const layer = Layers.access(page, indexPath);
          const pointList = draft.selectedPointLists[layer.do_objectID];
          const boundingRect = boundingRects[layer.do_objectID];

          if (!Layers.isPointsLayer(layer) || !pointList || !boundingRect)
            return;

          // Update all points by first transforming to the canvas's coordinate system
          layer.points
            .filter((_, index) => pointList.includes(index))
            .forEach((curvePoint) => {
              const decodedPoint = decodeCurvePoint(curvePoint, boundingRect);
              (['point', 'curveFrom', 'curveTo'] as const).forEach((key) => {
                const newValue =
                  mode === 'replace'
                    ? amount
                    : decodedPoint[key][axis] + amount;

                decodedPoint[key] = {
                  ...decodedPoint[key],
                  [axis]: newValue,
                };
              });

              const encodedPoint = encodeCurvePoint(decodedPoint, boundingRect);

              curvePoint.point = encodedPoint.point;
              curvePoint.curveFrom = encodedPoint.curveFrom;
              curvePoint.curveTo = encodedPoint.curveTo;
            });

          const decodedPoints = layer.points.map((curvePoint) =>
            decodeCurvePoint(curvePoint, boundingRect),
          );

          // Determine the new bounds of the updated points
          const newBounds = {
            minX: Math.min(
              ...decodedPoints.map((curvePoint) => curvePoint.point.x),
            ),
            maxX: Math.max(
              ...decodedPoints.map((curvePoint) => curvePoint.point.x),
            ),
            minY: Math.min(
              ...decodedPoints.map((curvePoint) => curvePoint.point.y),
            ),
            maxY: Math.max(
              ...decodedPoints.map((curvePoint) => curvePoint.point.y),
            ),
          };

          layer.frame = {
            ...layer.frame,
            ...createRectFromBounds(newBounds),
          };

          // Transform back to the range [0, 1], using the new bounds
          const encodedPoints = decodedPoints.map((decodedCurvePoint) =>
            encodeCurvePoint(decodedCurvePoint, layer.frame),
          );

          layer.points = encodedPoints;
        });
      });
    }
    default:
      return state;
  }
}

function visitSelectedDraftPoints(
  state: ApplicationState,
  f: (point: Sketch.CurvePoint) => void,
) {
  const pageIndex = getCurrentPageIndex(state);
  const layerIndexPaths = getSelectedLayerIndexPaths(state);

  return produce(state, (draft) => {
    layerIndexPaths.forEach((indexPath) => {
      const page = draft.sketch.pages[pageIndex];
      const layer = Layers.access(page, indexPath);
      const pointList = draft.selectedPointLists[layer.do_objectID];

      if (!Layers.isPointsLayer(layer) || !pointList) return;

      layer.points.forEach((point, index) => {
        if (!pointList.includes(index)) return;

        f(point);
      });
    });
  });
}
