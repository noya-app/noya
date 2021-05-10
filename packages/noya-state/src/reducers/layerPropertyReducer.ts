import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import * as Layers from '../layers';
import {
  getCurrentPage,
  getCurrentPageIndex,
  getLayerRotation,
  getLayerRotationMultiplier,
  getSelectedLayerIndexPaths,
} from '../selectors/selectors';
import { accessPageLayers, ApplicationState } from './applicationReducer';
import { SetNumberMode } from './styleReducer';

export type LayerPropertyAction =
  | [type: 'setLayerVisible', layerId: string | string[], visible: boolean]
  | [type: 'setExpandedInLayerList', layerId: string, expanded: boolean]
  | [type: 'setLayerRotation', rotation: number, mode?: SetNumberMode]
  | [type: 'setFixedRadius', amount: number, mode?: SetNumberMode];

export function layerPropertyReducer(
  state: ApplicationState,
  action: LayerPropertyAction,
): ApplicationState {
  switch (action[0]) {
    case 'setLayerVisible': {
      const [, id, visible] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = Layers.findAllIndexPaths(page, (layer) =>
        ids.includes(layer.do_objectID),
      );

      return produce(state, (draft) => {
        const layers = accessPageLayers(draft, pageIndex, indexPaths);

        layers.forEach((layer) => {
          layer.isVisible = visible;
        });
      });
    }
    case 'setExpandedInLayerList': {
      const [, id, expanded] = action;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        page,
        (layer) => layer.do_objectID === id,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
        const layer = Layers.access(draft.sketch.pages[pageIndex], indexPath);

        layer.layerListExpandedType = expanded
          ? Sketch.LayerListExpanded.Expanded
          : Sketch.LayerListExpanded.Collapsed;
      });
    }
    case 'setFixedRadius': {
      const [, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          if (layer._class !== 'rectangle') return;

          const newValue =
            mode === 'replace' ? amount : layer.fixedRadius + amount;

          layer.fixedRadius = Math.max(0, newValue);
        });
      });
    }
    case 'setLayerRotation': {
      const [, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          const rotation = getLayerRotation(layer);
          const newValue = mode === 'replace' ? amount : rotation + amount;

          layer.rotation = newValue * getLayerRotationMultiplier(layer);
        });
      });
    }
    default:
      return state;
  }
}
