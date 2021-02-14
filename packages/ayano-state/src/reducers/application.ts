import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { SketchFile } from 'sketch-zip';
import {
  getCurrentPage,
  getCurrentPageIndex,
  getCurrentPageMetadata,
  getSelectedLayerIndexPaths,
} from '../selectors';
import * as Models from '../models';
import * as Layers from '../layers';
import {
  createInitialInteractionState,
  InteractionAction,
  interactionReducer,
  InteractionState,
} from './interaction';
import { UUID } from '../types';
import { IndexPath } from 'tree-visit';
import { WritableDraft } from 'immer/dist/internal';
import { uuid } from 'sketch-canvas';

export type LayerHighlightPrecedence = 'aboveSelection' | 'belowSelection';

export type LayerHighlight = {
  id: string;
  precedence: LayerHighlightPrecedence;
};

export type ApplicationState = {
  interactionState: InteractionState;
  selectedPage: string;
  highlightedLayer?: LayerHighlight;
  selectedObjects: string[];
  sketch: SketchFile;
  canvasSize: { width: number; height: number };
  canvasInsets: { left: number };
};

export type SelectionType = 'replace' | 'intersection' | 'difference';

export type SetNumberMode = 'replace' | 'adjust';

type StyleElementType = 'Fill' | 'Border';

export type Action =
  | [
      type: 'setCanvasSize',
      size: { width: number; height: number },
      insets: { left: number },
    ]
  | [
      type: 'insertArtboard',
      details: { name: string; width: number; height: number },
    ]
  | [type: 'addDrawnLayer']
  | [
      type: 'selectLayer',
      layerId: string | string[] | undefined,
      selectionType?: SelectionType,
    ]
  | [type: 'highlightLayer', highlight: LayerHighlight | undefined]
  | [type: 'setExpandedInLayerList', layerId: string, expanded: boolean]
  | [type: 'selectPage', pageId: UUID]
  | [type: `addNew${StyleElementType}`]
  | [type: `delete${StyleElementType}`, index: number]
  | [
      type: `move${StyleElementType}`,
      sourceIndex: number,
      destinationIndex: number,
    ]
  | [type: `deleteDisabled${StyleElementType}s`]
  | [type: `set${StyleElementType}Enabled`, index: number, isEnabled: boolean]
  | [
      type: 'setBorderWidth',
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | [
      type: 'setFillOpacity',
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | [type: `set${StyleElementType}Color`, index: number, value: Sketch.Color]
  | [type: 'interaction', action: InteractionAction];

export function reducer(
  state: ApplicationState,
  action: Action,
): ApplicationState {
  switch (action[0]) {
    case 'setCanvasSize': {
      const [, size, insets] = action;

      return produce(state, (state) => {
        state.canvasSize = size;
        state.canvasInsets = insets;
      });
    }
    case 'insertArtboard': {
      const [, { name, width, height }] = action;
      const pageIndex = getCurrentPageIndex(state);
      const { scrollOrigin } = getCurrentPageMetadata(state);

      return produce(state, (state) => {
        let layer = produce(Models.artboard, (layer) => {
          layer.do_objectID = uuid();
          layer.name = name;
          layer.frame = {
            _class: 'rect',
            constrainProportions: false,
            // TODO: Figure out positioning based on other artboards.
            // Also, don't hardcode sidebar width.
            x: -scrollOrigin.x + 100,
            y: -scrollOrigin.y + 100,
            width,
            height,
          };
        });

        state.sketch.pages[pageIndex].layers.push(layer);
        state.interactionState = interactionReducer(state.interactionState, [
          'reset',
        ]);
        state.selectedObjects = [layer.do_objectID];
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

      return produce(state, (state) => {
        const layer = Layers.access(state.sketch.pages[pageIndex], indexPath);

        layer.layerListExpandedType = expanded
          ? Sketch.LayerListExpanded.Expanded
          : Sketch.LayerListExpanded.Collapsed;
      });
    }
    case 'addDrawnLayer': {
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (state) => {
        if (state.interactionState.type !== 'drawing') return;

        const layer = state.interactionState.value;

        if (layer.frame.width > 0 && layer.frame.height > 0) {
          state.sketch.pages[pageIndex].layers.push(layer);
          state.selectedObjects = [layer.do_objectID];
        }

        state.interactionState = interactionReducer(state.interactionState, [
          'reset',
        ]);
      });
    }
    case 'selectLayer': {
      const [, id, selectionType = 'replace'] = action;

      const ids = id === undefined ? [] : typeof id === 'string' ? [id] : id;

      return produce(state, (state) => {
        switch (selectionType) {
          case 'intersection':
            state.selectedObjects.push(
              ...ids.filter((id) => !state.selectedObjects.includes(id)),
            );
            return;
          case 'difference':
            ids.forEach((id) => {
              const selectedIndex = state.selectedObjects.indexOf(id);
              state.selectedObjects.splice(selectedIndex, 1);
            });
            return;
          case 'replace':
            state.selectedObjects = [...ids];
            return;
        }
      });
    }
    case 'highlightLayer': {
      const [, highlight] = action;

      return produce(state, (state) => {
        state.highlightedLayer = highlight ? { ...highlight } : undefined;
      });
    }
    case 'selectPage': {
      return produce(state, (state) => {
        state.selectedPage = action[1];
      });
    }
    case 'addNewBorder':
    case 'addNewFill': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'addNewBorder':
              if (style.borders) {
                style.borders.unshift(Models.border);
              } else {
                style.borders = [Models.border];
              }
              break;
            case 'addNewFill':
              if (style.fills) {
                style.fills.unshift(Models.fill);
              } else {
                style.fills = [Models.fill];
              }
              break;
          }
        });
      });
    }
    case 'setBorderEnabled':
    case 'setFillEnabled': {
      const [, index, isEnabled] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'setBorderEnabled':
              if (style.borders && style.borders[index]) {
                style.borders[index].isEnabled = isEnabled;
              }
              break;
            case 'setFillEnabled':
              if (style.fills && style.fills[index]) {
                style.fills[index].isEnabled = isEnabled;
              }
              break;
          }
        });
      });
    }
    case 'deleteBorder':
    case 'deleteFill': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'deleteBorder':
              if (style.borders) {
                style.borders.splice(action[1], 1);
              }
              break;
            case 'deleteFill':
              if (style.fills) {
                style.fills.splice(action[1], 1);
              }
              break;
          }
        });
      });
    }
    case 'moveBorder':
    case 'moveFill': {
      const [, sourceIndex, destinationIndex] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'moveBorder':
              if (style.borders) {
                const sourceItem = style.borders[sourceIndex];

                style.borders.splice(sourceIndex, 1);
                style.borders.splice(destinationIndex, 0, sourceItem);
              }
              break;
            case 'moveFill':
              if (style.fills) {
                const sourceItem = style.fills[sourceIndex];

                style.fills.splice(sourceIndex, 1);
                style.fills.splice(destinationIndex, 0, sourceItem);
              }
              break;
          }
        });
      });
    }
    case 'deleteDisabledBorders':
    case 'deleteDisabledFills': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'deleteDisabledBorders':
              if (style.borders) {
                style.borders = style.borders.filter(
                  (border) => border.isEnabled,
                );
              }
              break;
            case 'deleteDisabledFills':
              if (style.fills) {
                style.fills = style.fills.filter((fill) => fill.isEnabled);
              }
              break;
          }
        });
      });
    }

    case 'setBorderColor':
    case 'setFillColor': {
      const [, index, color] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'setBorderColor':
              if (style.borders && style.borders[index]) {
                style.borders[index].color = color;
              }
              break;
            case 'setFillColor':
              if (style.fills && style.fills[index]) {
                style.fills[index].color = color;
              }
              break;
          }
        });
      });
    }
    case 'setBorderWidth': {
      const [, index, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (style && style.borders && style.borders[index]) {
            const newValue =
              mode === 'replace'
                ? amount
                : style.borders[index].thickness + amount;

            style.borders[index].thickness = Math.max(0, newValue);
          }
        });
      });
    }
    case 'setFillOpacity': {
      const [, index, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (style && style.fills && style.fills[index]) {
            const newValue =
              mode === 'replace'
                ? amount
                : style.fills[index].color.alpha + amount;

            style.fills[index].color.alpha = Math.min(Math.max(0, newValue), 1);
          }
        });
      });
    }
    case 'interaction': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        state.interactionState = interactionReducer(
          state.interactionState,
          action[1],
        );

        if (state.interactionState.type === 'moving') {
          const { previous, next } = state.interactionState;

          accessPageLayers(state, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              const delta = {
                x: next.x - previous.x,
                y: next.y - previous.y,
              };

              layer.frame.x += delta.x;
              layer.frame.y += delta.y;
            },
          );
        }
      });
    }
    default:
      return state;
  }
}

/**
 * Get an array of all layers using as few lookups as possible on the state tree.
 *
 * Immer will duplicate any objects we access within a produce method, so we
 * don't want to walk every layer, since that would duplicate all of them.
 */
function accessPageLayers(
  state: WritableDraft<ApplicationState>,
  pageIndex: number,
  layerIndexPaths: IndexPath[],
): Sketch.AnyLayer[] {
  return layerIndexPaths.map((layerIndex) => {
    return Layers.access(state.sketch.pages[pageIndex], layerIndex);
  });
}

export function createInitialState(sketch: SketchFile): ApplicationState {
  if (sketch.pages.length === 0) {
    throw new Error('Invalid Sketch file - no pages');
  }

  return {
    interactionState: createInitialInteractionState(),
    selectedPage: sketch.pages[0].do_objectID,
    selectedObjects: [],
    highlightedLayer: undefined,
    sketch,
    canvasSize: { width: 0, height: 0 },
    canvasInsets: { left: 0 },
  };
}
