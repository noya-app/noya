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
  | [type: 'setLayerIsLocked', layerId: string | string[], isLocked: boolean]
  | [type: 'setExpandedInLayerList', layerId: string, expanded: boolean]
  | [type: 'setLayerX', rotation: number, mode?: SetNumberMode]
  | [type: 'setLayerY', rotation: number, mode?: SetNumberMode]
  | [type: 'setLayerWidth', rotation: number, mode?: SetNumberMode]
  | [type: 'setLayerHeight', rotation: number, mode?: SetNumberMode]
  | [type: 'setLayerRotation', rotation: number, mode?: SetNumberMode]
  | [type: 'setFixedRadius', amount: number, mode?: SetNumberMode]
  | [type: 'setIsFlippedVertical', value: boolean]
  | [type: 'setIsFlippedHorizontal', value: boolean]
  | [type: 'setHasClippingMask', value: boolean]
  | [type: 'setShouldBreakMaskChain', value: boolean];

export function layerPropertyReducer(
  state: ApplicationState,
  action: LayerPropertyAction,
): ApplicationState {
  switch (action[0]) {
    case 'setLayerVisible':
    case 'setLayerIsLocked': {
      const [type, id, value] = action;
      const propertyName =
        type === 'setLayerVisible' ? 'isVisible' : 'isLocked';

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = Layers.findAllIndexPaths(page, (layer) =>
        ids.includes(layer.do_objectID),
      );

      return produce(state, (draft) => {
        const layers = accessPageLayers(draft, pageIndex, indexPaths);

        layers.forEach((layer) => {
          layer[propertyName] = value;
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
          layer.points.forEach((point) => {
            point.cornerRadius = newValue;
          });
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
    case 'setLayerX':
    case 'setLayerY': {
      const [type, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      const property = type === 'setLayerX' ? ('x' as const) : ('y' as const);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          const value = layer.frame[property];

          layer.frame[property] = mode === 'replace' ? amount : value + amount;
        });
      });
    }
    case 'setLayerWidth':
    case 'setLayerHeight': {
      const [type, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      const property =
        type === 'setLayerWidth' ? ('width' as const) : ('height' as const);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          const value = layer.frame[property];

          layer.frame[property] = Math.max(
            mode === 'replace' ? amount : value + amount,
            0.5,
          );
        });
      });
    }
    case 'setIsFlippedVertical': {
      const [, value] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          layer.isFlippedVertical = value;
        });
      });
    }
    case 'setIsFlippedHorizontal': {
      const [, value] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          layer.isFlippedHorizontal = value;
        });
      });
    }
    case 'setHasClippingMask': {
      const [, value] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          layer.hasClippingMask = value;
        });
      });
    }
    case 'setShouldBreakMaskChain': {
      const [, value] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          layer.shouldBreakMaskChain = value;
        });
      });
    }
    default:
      return state;
  }
}
