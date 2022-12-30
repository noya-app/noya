import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import Sketch from 'noya-file-format';
import * as Layers from '../layers';
import {
  getCurrentPage,
  getCurrentPageIndex,
  getSelectedLayerIndexPaths,
  moveControlPoints,
  moveSelectedPoints,
} from '../selectors';
import { SetNumberMode } from '../types';
import { SelectionType, updateSelection } from '../utils/selection';
import { ApplicationState, SelectedPointLists } from './applicationReducer';

export type PointAction =
  | [type: 'setPointCurveMode', curveMode: Sketch.CurveMode]
  | [type: 'setPointCornerRadius', amount: number, mode?: SetNumberMode]
  | [
      type: 'setPointX' | 'setPointY',
      pointLists: SelectedPointLists,
      amount: number,
      mode?: SetNumberMode,
    ]
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
        for (const layerId in draft.selectedPointLists) {
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
        for (const layerId in draft.selectedPointLists) {
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
      const [type, selectedPointList, amount, mode = 'replace'] = action;

      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const delta = type === 'setPointX' ? { x: amount } : { y: amount };

        moveSelectedPoints(
          selectedPointList,
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
      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const selectedControlPoint = state.selectedControlPoint;

      if (!selectedControlPoint) return state;

      const indexPath = Layers.findIndexPath(
        page,
        (layer) => layer.do_objectID === selectedControlPoint.layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
        const delta =
          type === 'setControlPointX' ? { x: amount } : { y: amount };

        moveControlPoints(
          selectedControlPoint,
          indexPath,
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

/**
 * Layers with an `edited` property track whether their points have been changed.
 * This affects whether certain inspectable properties, like `numberOfPoints`, are
 * still meaningful/editable.
 */
export function markLayersAsEdited(state: ApplicationState) {
  const pageIndex = getCurrentPageIndex(state);
  const layerIndexPaths = getSelectedLayerIndexPaths(state);

  return produce(state, (draft) => {
    layerIndexPaths.forEach((indexPath) => {
      const page = draft.sketch.pages[pageIndex];
      const layer = Layers.access(page, indexPath);
      const pointList = draft.selectedControlPoint
        ? [draft.selectedControlPoint.pointIndex]
        : draft.selectedPointLists[layer.do_objectID];

      if (
        !Layers.isLayerWithEditedProperty(layer) ||
        !pointList ||
        pointList.length === 0
      )
        return;

      layer.edited = true;
    });
  });
}
