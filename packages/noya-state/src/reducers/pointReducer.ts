import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import * as Layers from '../layers';
import {
  getCurrentPageIndex,
  getSelectedLayerIndexPaths,
  moveControlPoints,
  moveSelectedPoints,
} from '../selectors/selectors';
import { SelectionType, updateSelection } from '../utils/selection';
import { ApplicationState, SetNumberMode } from './applicationReducer';

export type PointAction =
  | [type: 'setPointCurveMode', curveMode: Sketch.CurveMode]
  | [type: 'setPointCornerRadius', amount: number, mode?: SetNumberMode]
  | [type: 'setPointX' | 'setPointY', amount: number, mode?: SetNumberMode]
  | [
      type: 'setControlPointX' | 'setControlPointY',
      amount: number,
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
    ];

export type SelectedPoint = [layerId: string, index: number];

export function pointReducer(
  state: ApplicationState,
  action: PointAction,
  CanvasKit: CanvasKit,
): ApplicationState {
  switch (action[0]) {
    case 'setPointCurveMode': {
      const [, curveMode] = action;

      return visitSelectedDraftPoints(state, (curvePoint) => {
        curvePoint.curveMode = curveMode;
        if (curveMode !== Sketch.CurveMode.Straight) {
          curvePoint.hasCurveFrom = true;
          curvePoint.hasCurveTo = true;
        }
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
      const [, layerId, pointIndex, controlPointType] = action;

      return produce(state, (draft) => {
        for (let layerId in draft.selectedPointLists) {
          draft.selectedPointLists[layerId] = [];
        }

        draft.selectedControlPoint = {
          layerId,
          pointIndex,
          controlPointType,
        };
      });
    }
    case 'setPointX':
    case 'setPointY': {
      const [type, amount, mode = 'replace'] = action;

      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const delta = type === 'setPointX' ? { x: amount } : { y: amount };

        moveSelectedPoints(
          draft.selectedPointLists,
          layerIndexPaths,
          delta,
          mode,
          draft.sketch.pages[pageIndex],
          draft.sketch.pages[pageIndex],
          CanvasKit,
        );
      });
    }
    case 'setControlPointX':
    case 'setControlPointY': {
      const [type, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        if (!draft.selectedControlPoint) return;
        const delta =
          type === 'setControlPointX' ? { x: amount } : { y: amount };

        moveControlPoints(
          draft.selectedControlPoint,
          layerIndexPaths,
          delta,
          mode,
          draft.sketch.pages[pageIndex],
          draft.sketch.pages[pageIndex],
          CanvasKit,
        );
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
      const pointList = draft.selectedControlPoint
        ? [draft.selectedControlPoint.pointIndex]
        : draft.selectedPointLists[layer.do_objectID];

      if (!Layers.isPointsLayer(layer) || !pointList) return;

      layer.points.forEach((point, index) => {
        if (!pointList.includes(index)) return;

        f(point);
      });
    });
  });
}
