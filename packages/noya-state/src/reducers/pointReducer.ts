import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import { createRectFromBounds, distance, Rect } from 'noya-geometry';
import {
  decodeCurvePoint,
  encodeCurvePoint,
} from 'noya-renderer/src/primitives';
import { path } from 'noya-renderer/src/primitives/path';
import * as Layers from '../layers';
import {
  getBoundingRectMap,
  getCurrentPage,
  getCurrentPageIndex,
  getSelectedLayerIndexPaths,
} from '../selectors/selectors';
import { SelectionType, updateSelection } from '../utils/selection';
import {
  ApplicationState,
  controlPointType,
  SetNumberMode,
} from './applicationReducer';

export type PointAction =
  | [type: 'setPointCurveMode', curveMode: Sketch.CurveMode]
  | [type: 'setPointCornerRadius', amount: number, mode?: SetNumberMode]
  | [type: 'setPointX' | 'setPointY', amount: number, mode?: SetNumberMode]
  | [
      type: 'setControlPointX' | 'setControlPointY',
      amount: number,
      controlPointType: controlPointType | undefined,
      canvasKit: CanvasKit,
      mode?: SetNumberMode,
    ]
  | [
      type: 'selectPoint',
      selectedPoint: SelectedPoint | undefined,
      selectionType?: SelectionType,
    ]
  | [
      type: 'selectControlPoint',
      layerId: string,
      pointIndex: number,
      controlPointType: 'curveFrom' | 'curveTo',
      curveMode: Sketch.CurveMode,
    ];

export type SelectedPoint = [layerId: string, index: number];

// function findMissingValue(
//   distance: number,
//   centerPoint: Point,
//   partial: number,
// ) {
//   let x = undefined;

//   x =
//     (Math.sqrt(Math.pow(distance, 2) - Math.pow(centerPoint.y - partial, 2)) -
//       centerPoint.x) *
//     -1;

//   return x;
// }

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
      const [, selectedPoint, selectionType = 'replace'] = action;

      return produce(state, (draft) => {
        draft.selectedControlPoint = undefined;
        for (let layerId in draft.selectedPointLists) {
          const currentIds = draft.selectedPointLists[layerId];
          updateSelection(
            currentIds,
            selectedPoint && selectedPoint[0] === layerId
              ? selectedPoint[1]
              : undefined,
            selectionType,
          );
        }
      });
    }
    case 'selectControlPoint': {
      const [, layerId, pointIndex, controlPointType, curveMode] = action;

      return produce(state, (draft) => {
        for (let layerId in draft.selectedPointLists) {
          draft.selectedPointLists[layerId] = [];
        }

        draft.selectedControlPoint = {
          layerId,
          pointIndex,
          controlPointType,
          curveMode,
        };
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
    case 'setControlPointX':
    case 'setControlPointY': {
      if (!state.selectedControlPoint) return state;
      const [type, amount, controlPointType, CanvasKit, mode] = action;
      const axis = type === 'setControlPointX' ? 'x' : 'y';

      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);
      const boundingRects = getBoundingRectMap(
        getCurrentPage(state),
        [state.selectedControlPoint?.layerId],
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
          const pointList = [draft.selectedControlPoint?.pointIndex];
          const curveMode = draft.selectedControlPoint?.curveMode;
          const boundingRect = boundingRects[layer.do_objectID];

          if (!Layers.isPointsLayer(layer) || !pointList || !boundingRect)
            return;

          // Update all points by first transforming to the canvas's coordinate system
          layer.points
            .filter((_, index) => pointList.includes(index))
            .forEach((curvePoint) => {
              const decodedPoint = decodeCurvePoint(curvePoint, boundingRect);
              if (!controlPointType) return state;

              const selectedControlPointValue =
                mode === 'replace'
                  ? amount
                  : decodedPoint[controlPointType][axis] + amount;

              const oppositeControlPoint =
                controlPointType === 'curveFrom' ? 'curveTo' : 'curveFrom';

              // const oppositAxis = axis === 'x' ? 'y' : 'x';

              const delta = decodedPoint[controlPointType][axis] - amount;

              const controlPointDistance = distance(
                decodedPoint.point,
                decodedPoint[oppositeControlPoint],
              );

              if (
                (controlPointType === 'curveFrom' ||
                  controlPointType === 'curveTo') &&
                curveMode === Sketch.CurveMode.Mirrored
              ) {
                const oppositeControlPointValue =
                  mode === 'replace'
                    ? decodedPoint[oppositeControlPoint][axis] + delta
                    : decodedPoint[oppositeControlPoint][axis] + amount * -1;

                decodedPoint[oppositeControlPoint] = {
                  ...decodedPoint[oppositeControlPoint],
                  [axis]: oppositeControlPointValue,
                };

                decodedPoint[controlPointType] = {
                  ...decodedPoint[controlPointType],
                  [axis]: selectedControlPointValue,
                };
              } else if (
                (controlPointType === 'curveFrom' ||
                  controlPointType === 'curveTo') &&
                curveMode === Sketch.CurveMode.Asymmetric
              ) {
                let theta = Math.atan2(
                  decodedPoint[controlPointType].y - decodedPoint.point.y,
                  decodedPoint[controlPointType].x - decodedPoint.point.x,
                );

                if (theta < 0) theta = Math.abs(theta);
                else theta = 2 * Math.PI - theta;

                const circlePoints = {
                  x:
                    controlPointDistance * Math.cos(theta * (180 / Math.PI)) +
                    decodedPoint.point.x,
                  y:
                    controlPointDistance * Math.sin(theta * (180 / Math.PI)) +
                    decodedPoint.point.y,
                };

                decodedPoint[oppositeControlPoint] = {
                  ...circlePoints,
                };

                decodedPoint[controlPointType] = {
                  ...decodedPoint[controlPointType],
                  [axis]: selectedControlPointValue,
                };
              } else {
                decodedPoint[controlPointType] = {
                  ...decodedPoint[controlPointType],
                  [axis]: selectedControlPointValue,
                };
              }

              const encodedPoint = encodeCurvePoint(decodedPoint, boundingRect);

              //TODO: why are the controlPointTypes switched?

              if (controlPointType === 'curveFrom') {
                curvePoint.curveTo = encodedPoint.curveTo;
                if (
                  curveMode === Sketch.CurveMode.Mirrored ||
                  curveMode === Sketch.CurveMode.Asymmetric
                ) {
                  curvePoint.curveFrom = encodedPoint.curveFrom;
                }
              } else {
                curvePoint.curveFrom = encodedPoint.curveFrom;
                if (
                  curveMode === Sketch.CurveMode.Mirrored ||
                  curveMode === Sketch.CurveMode.Asymmetric
                ) {
                  curvePoint.curveTo = encodedPoint.curveTo;
                }
              }
            });

          const decodedPoints = layer.points.map((curvePoint) =>
            decodeCurvePoint(curvePoint, boundingRect),
          );

          const layerPath = path(
            CanvasKit,
            layer.points,
            layer.frame,
          ).computeTightBounds();

          const newRect: Rect = {
            x: layerPath[0],
            y: layerPath[1],
            width: layerPath[2] - layerPath[0],
            height: layerPath[3] - layerPath[1],
          };

          layer.frame = {
            ...layer.frame,
            ...newRect,
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
