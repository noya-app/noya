import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { createRectFromBounds } from 'noya-geometry';
import {
  parseCurvePoint,
  unparseCurvePoint,
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
  | [type: 'setPointX' | 'setPointY', amount: number, mode?: SetNumberMode];

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
              const parsedPoint = parseCurvePoint(curvePoint, boundingRect);

              (['point', 'curveFrom', 'curveTo'] as const).forEach((key) => {
                const newValue =
                  mode === 'replace' ? amount : parsedPoint[key][axis] + amount;

                parsedPoint[key] = {
                  ...parsedPoint[key],
                  [axis]: newValue,
                };
              });

              const unparsedPoint = unparseCurvePoint(
                parsedPoint,
                boundingRect,
              );

              curvePoint.point = unparsedPoint.point;
            });

          const parsedPoints = layer.points.map((curvePoint) =>
            parseCurvePoint(curvePoint, boundingRect),
          );

          // Determine the new bounds of the updated points
          const newBounds = {
            minX: Math.min(
              ...parsedPoints.map((curvePoint) => curvePoint.point.x),
            ),
            maxX: Math.max(
              ...parsedPoints.map((curvePoint) => curvePoint.point.x),
            ),
            minY: Math.min(
              ...parsedPoints.map((curvePoint) => curvePoint.point.y),
            ),
            maxY: Math.max(
              ...parsedPoints.map((curvePoint) => curvePoint.point.y),
            ),
          };

          layer.frame = {
            ...layer.frame,
            ...createRectFromBounds(newBounds),
          };

          // Transform back to the range [0, 1], using the new bounds
          const unparsedPoints = parsedPoints.map((parsedCurvePoint) =>
            unparseCurvePoint(parsedCurvePoint, layer.frame),
          );

          layer.points = unparsedPoints;
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
