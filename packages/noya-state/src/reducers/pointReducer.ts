import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import * as Layers from '../layers';
import {
  getCurrentPageIndex,
  getSelectedLayerIndexPaths,
} from '../selectors/selectors';
import { ApplicationState, SetNumberMode } from './applicationReducer';

export type PointAction =
  | [type: 'setPointCurveMode', curveMode: Sketch.CurveMode]
  | [type: 'setPointCornerRadius', amount: number, mode?: SetNumberMode];

export function pointReducer(
  state: ApplicationState,
  action: PointAction,
): ApplicationState {
  switch (action[0]) {
    case 'setPointCurveMode':
      const [, curveMode] = action;

      return visitSelectedDraftPoints(state, (point) => {
        point.curveMode = curveMode;
      });
    case 'setPointCornerRadius':
      const [, amount, mode] = action;

      return visitSelectedDraftPoints(state, (point) => {
        const newValue =
          mode === 'replace' ? amount : point.cornerRadius + amount;

        point.cornerRadius = Math.max(0, newValue);
      });
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
      const layer = Layers.access(draft.sketch.pages[pageIndex], indexPath);
      const pointList = draft.selectedPointLists[layer.do_objectID];

      if (!Layers.isPointsLayer(layer) || !pointList) return;

      layer.points.forEach((point, index) => {
        if (!pointList.includes(index)) return;

        f(point);
      });
    });
  });
}
