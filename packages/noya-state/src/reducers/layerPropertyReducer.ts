import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import * as Layers from '../layers';
import { decodeCurvePoint, encodeCurvePoint } from '../primitives/path';
import {
  computeNewBoundingRect,
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
  | [type: 'setLayerX', value: number, mode?: SetNumberMode]
  | [type: 'setLayerY', value: number, mode?: SetNumberMode]
  | [type: 'setLayerWidth', value: number, mode?: SetNumberMode]
  | [type: 'setLayerHeight', value: number, mode?: SetNumberMode]
  | [type: 'setLayerRotation', value: number, mode?: SetNumberMode]
  | [type: 'setFixedRadius', amount: number, mode?: SetNumberMode]
  | [type: 'setIsClosed', value: boolean]
  | [type: 'setIsFlippedVertical', value: boolean]
  | [type: 'setIsFlippedHorizontal', value: boolean]
  | [type: 'setHasClippingMask', value: boolean]
  | [type: 'setShouldBreakMaskChain', value: boolean];

export function layerPropertyReducer(
  state: ApplicationState,
  action: LayerPropertyAction,
  CanvasKit: CanvasKit,
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
            point.cornerRadius = layer.fixedRadius;
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

          layer.rotation = newValue * getLayerRotationMultiplier();
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
    case 'setIsClosed': {
      const [, value] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          if (!Layers.isPointsLayer(layer)) return;
          layer.isClosed = value;

          const decodedPoints = layer.points.map((point) =>
            decodeCurvePoint(point, layer.frame),
          );

          layer.frame = {
            ...layer.frame,
            ...computeNewBoundingRect(CanvasKit, decodedPoints, layer),
          };

          // Transform back to the range [0, 1], using the new bounds
          layer.points = decodedPoints.map((decodedCurvePoint) =>
            encodeCurvePoint(decodedCurvePoint, layer.frame),
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
