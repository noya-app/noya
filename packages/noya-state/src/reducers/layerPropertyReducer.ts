import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import Sketch from 'noya-file-format';
import * as Layers from '../layers';
import { decodeCurvePoint, encodeCurvePoint } from '../primitives/path';
import {
  computeCurvePointBoundingRect,
  findPageLayerIndexPaths,
  fixGroupFrameHierarchy,
  getCurrentPage,
  getCurrentPageIndex,
  getLayerRotation,
  getLayerRotationMultiplier,
  getSelectedLayerIndexPaths,
  resizeLayerFrame,
} from '../selectors';
import { accessPageLayers } from '../selectors/layerSelectors';
import { SetNumberMode } from '../types';
import type { ApplicationState } from './applicationReducer';

export type LayerPropertyAction =
  | [type: 'setLayerName', layerId: string, name: string]
  | [type: 'setLayerVisible', layerId: string | string[], visible: boolean]
  | [type: 'setLayerIsLocked', layerId: string | string[], isLocked: boolean]
  | [
      type: 'setExpandedInLayerList',
      layerId: string,
      expanded: boolean,
      target: 'self' | 'recursive',
    ]
  | [type: 'setConstrainProportions', value: boolean]
  | [type: 'setLayerX', value: number, mode?: SetNumberMode]
  | [type: 'setLayerY', value: number, mode?: SetNumberMode]
  | [
      type: 'setLayerWidth',
      layerId: string | string[] | undefined,
      value: number,
      mode?: SetNumberMode,
    ]
  | [
      type: 'setLayerHeight',
      layerId: string | string[] | undefined,
      value: number,
      mode?: SetNumberMode,
    ]
  | [type: 'setLayerRotation', value: number, mode?: SetNumberMode]
  | [type: 'setFixedRadius', amount: number, mode?: SetNumberMode]
  | [type: 'setIsClosed', value: boolean]
  | [type: 'setIsFlippedVertical', value: boolean]
  | [type: 'setIsFlippedHorizontal', value: boolean]
  | [type: 'setHasClippingMask', value: boolean]
  | [type: 'setShouldBreakMaskChain', value: boolean]
  | [type: 'setMaskMode', value: 'alpha' | 'outline']
  | [
      type: 'setBlockText',
      layerId: string | string[] | undefined,
      value?: string,
      normalizedText?: string,
    ]
  | [
      type: 'setBlockParameters',
      layerId: string | string[] | undefined,
      value: string[],
    ]
  | [
      type: 'setResolvedBlockData',
      layerId: string,
      value: Sketch.SymbolInstance['resolvedBlockData'],
    ]
  | [
      type: 'setSymbolIdIsFixed',
      layerId: string | string[] | undefined,
      value: boolean,
    ];

export function layerPropertyReducer(
  state: ApplicationState,
  action: LayerPropertyAction,
  CanvasKit: CanvasKit,
): ApplicationState {
  function getTargetIds(id: string | string[] | undefined) {
    return id === undefined
      ? state.selectedLayerIds
      : typeof id === 'string'
      ? [id]
      : id;
  }

  function getTargetIndexPaths(id: string | string[] | undefined) {
    const ids = getTargetIds(id);
    const page = getCurrentPage(state);
    const pageIndex = getCurrentPageIndex(state);
    const indexPaths = Layers.findAllIndexPaths(page, (layer) =>
      ids.includes(layer.do_objectID),
    );

    return { pageIndex, indexPaths };
  }

  switch (action[0]) {
    case 'setLayerName': {
      const [, layerId, name] = action;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        page,
        (layer) => layer.do_objectID === layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
        const draftLayer = Layers.access(
          draft.sketch.pages[pageIndex],
          indexPath,
        );
        draftLayer.name = name;
      });
    }
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
      const [, id, expanded, target] = action;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        page,
        (layer) => layer.do_objectID === id,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
        const draftLayer = Layers.access(
          draft.sketch.pages[pageIndex],
          indexPath,
        );

        const newState = expanded
          ? Sketch.LayerListExpanded.Expanded
          : Sketch.LayerListExpanded.Collapsed;

        draftLayer.layerListExpandedType = newState;

        if (target === 'recursive') {
          Layers.visit(draftLayer, (nestedDraftLayer) => {
            nestedDraftLayer.layerListExpandedType = newState;
          });
        }
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
    case 'setConstrainProportions': {
      const [, value] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          layer.frame.constrainProportions = value;
        });
      });
    }
    case 'setLayerRotation': {
      const [, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          if (Layers.isSymbolMasterOrArtboard(layer)) return;

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
      const indexPaths = getSelectedLayerIndexPaths(state);

      const property = type === 'setLayerX' ? ('x' as const) : ('y' as const);

      return produce(state, (draft) => {
        indexPaths.forEach((indexPath) => {
          const draftPage = draft.sketch.pages[pageIndex];
          const draftLayer = Layers.access(draftPage, indexPath);

          const value = draftLayer.frame[property];
          const newValue = mode === 'replace' ? amount : value + amount;

          const newLayer = resizeLayerFrame(draftLayer, {
            ...draftLayer.frame,
            [property]: newValue,
          });

          Layers.assign(draftPage, indexPath, newLayer);

          fixGroupFrameHierarchy(draftPage, indexPath.slice(0, -1));
        });
      });
    }
    case 'setLayerWidth':
    case 'setLayerHeight': {
      const [type, id, amount, mode = 'replace'] = action;
      const { pageIndex, indexPaths } = getTargetIndexPaths(id);

      const property =
        type === 'setLayerWidth' ? ('width' as const) : ('height' as const);
      const otherProperty =
        type === 'setLayerWidth' ? ('height' as const) : ('width' as const);

      return produce(state, (draft) => {
        indexPaths.forEach((indexPath) => {
          const draftPage = draft.sketch.pages[pageIndex];
          const draftLayer = Layers.access(draftPage, indexPath);

          const value = draftLayer.frame[property];
          const otherValue = draftLayer.frame[otherProperty];
          const aspectRatio = value / otherValue;

          const newValue = Math.max(
            mode === 'replace' ? amount : value + amount,
            0.5,
          );

          const newFrame = {
            ...draftLayer.frame,
            [property]: newValue,
            ...(draftLayer.frame.constrainProportions && {
              [otherProperty]: newValue / aspectRatio,
            }),
          };

          const newLayer = resizeLayerFrame(draftLayer, newFrame);

          Layers.assign(draftPage, indexPath, newLayer);

          fixGroupFrameHierarchy(draftPage, indexPath.slice(0, -1));
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
            ...computeCurvePointBoundingRect(
              CanvasKit,
              decodedPoints,
              layer.frame,
              layer.isClosed,
            ),
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
          if (Layers.isSymbolMasterOrArtboard(layer)) return;

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
          if (Layers.isSymbolMasterOrArtboard(layer)) return;

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
    case 'setMaskMode': {
      const [, value] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          layer.clippingMaskMode = value === 'alpha' ? 1 : 0;
        });
      });
    }
    case 'setBlockText': {
      const [, id, value, normalizedText] = action;
      const { pageIndex, indexPaths } = getTargetIndexPaths(id);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, indexPaths).forEach((layer) => {
          if (!Layers.isSymbolInstance(layer)) return;

          layer.blockText = value;

          if (
            layer.resolvedBlockData &&
            layer.resolvedBlockData.originalText !== (normalizedText ?? value)
          ) {
            delete layer.resolvedBlockData;
          }
        });
      });
    }
    case 'setBlockParameters': {
      const [, id, value] = action;
      const { pageIndex, indexPaths } = getTargetIndexPaths(id);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, indexPaths).forEach((layer) => {
          if (!Layers.isSymbolInstance(layer)) return;

          layer.blockParameters = value;
        });
      });
    }
    case 'setResolvedBlockData': {
      const [, id, value] = action;
      const layerIndexPaths = findPageLayerIndexPaths(
        state,
        (layer) => layer.do_objectID === id,
      );

      return produce(state, (draft) => {
        layerIndexPaths.forEach(({ pageIndex, indexPaths }) => {
          const layer = Layers.access(
            draft.sketch.pages[pageIndex],
            indexPaths[0],
          );

          if (!Layers.isSymbolInstance(layer)) return;

          layer.resolvedBlockData = value;
        });
      });
    }
    case 'setSymbolIdIsFixed': {
      const [, id, value] = action;
      const { pageIndex, indexPaths } = getTargetIndexPaths(id);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, indexPaths).forEach((layer) => {
          if (Layers.isSymbolInstance(layer)) {
            layer.symbolIDIsFixed = value;
          }
        });
      });
    }
    default:
      return state;
  }
}
