import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { SketchFile } from 'sketch-zip';
import {
  getCurrentPage,
  getCurrentPageIndex,
  getSelectedLayerIndexes,
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

export type ApplicationState = {
  interactionState: InteractionState;
  selectedPage: string;
  highlightedLayerId?: string;
  selectedObjects: string[];
  sketch: SketchFile;
};

export type SelectionType = 'replace' | 'intersection' | 'difference';

type StyleElementType = 'Fill' | 'Border';

export type Action =
  | [type: 'addDrawnLayer']
  | [
      type: 'selectLayer',
      layerId: string | string[],
      selectionType?: SelectionType,
    ]
  | [type: 'highlightLayer', layerId: string | undefined]
  | [type: 'setExpandedInLayerList', layerId: string, expanded: boolean]
  | [type: 'deselectAllLayers']
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
  | [type: 'nudgeBorderWidth', index: number, amount: number]
  | [type: 'interaction', action: InteractionAction];

export function reducer(
  state: ApplicationState,
  action: Action,
): ApplicationState {
  switch (action[0]) {
    case 'setExpandedInLayerList':
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
      const [, id, selectionType] = action;

      const ids = typeof id === 'string' ? [id] : id;

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
          default:
            state.selectedObjects = [...ids];
            return;
        }
      });
    }
    case 'highlightLayer': {
      const [, id] = action;

      return produce(state, (state) => {
        state.highlightedLayerId = id;
      });
    }
    case 'deselectAllLayers': {
      return produce(state, (state) => {
        state.selectedObjects = [];
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
      const layerIndexes = getSelectedLayerIndexes(state);

      return produce(state, (state) => {
        layerIndexes.forEach((layerIndex) => {
          const style = state.sketch.pages[pageIndex].layers[layerIndex].style;

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
      const layerIndexes = getSelectedLayerIndexes(state);

      return produce(state, (state) => {
        layerIndexes.forEach((layerIndex) => {
          const style = state.sketch.pages[pageIndex].layers[layerIndex].style;

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
      const layerIndexes = getSelectedLayerIndexes(state);

      return produce(state, (state) => {
        layerIndexes.forEach((layerIndex) => {
          const style = state.sketch.pages[pageIndex].layers[layerIndex].style;

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
      const layerIndexes = getSelectedLayerIndexes(state);

      return produce(state, (state) => {
        layerIndexes.forEach((layerIndex) => {
          const style = state.sketch.pages[pageIndex].layers[layerIndex].style;

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
      const layerIndexes = getSelectedLayerIndexes(state);

      return produce(state, (state) => {
        layerIndexes.forEach((layerIndex) => {
          const style = state.sketch.pages[pageIndex].layers[layerIndex].style;

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
    case 'nudgeBorderWidth': {
      const [, index, amount] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexes = getSelectedLayerIndexes(state);

      return produce(state, (state) => {
        layerIndexes.forEach((layerIndex) => {
          const style = state.sketch.pages[pageIndex].layers[layerIndex].style;

          if (style && style.borders && style.borders[index]) {
            style.borders[index].thickness = Math.max(
              0,
              style.borders[index].thickness + amount,
            );
          }
        });
      });
    }
    case 'interaction': {
      return produce(state, (state) => {
        state.interactionState = interactionReducer(
          state.interactionState,
          action[1],
        );
      });
    }
    default:
      return state;
  }
}

export function createInitialState(sketch: SketchFile): ApplicationState {
  if (sketch.pages.length === 0) {
    throw new Error('Invalid Sketch file - no pages');
  }

  return {
    interactionState: createInitialInteractionState(),
    selectedPage: sketch.pages[0].do_objectID,
    selectedObjects: [],
    highlightedLayerId: undefined,
    sketch,
  };
}
