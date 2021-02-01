import type Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { SketchFile } from 'sketch-zip';
import { getCurrentPageIndex, getSelectedLayerIndexes } from './selectors';
import * as Models from './models';

export * as Selectors from './selectors';

export type UUID = string;

export type Point = { x: number; y: number };

export type Rect = { x: number; y: number; width: number; height: number };

export type InteractionState =
  | {
      type: 'none';
    }
  | {
      type: 'insertRectangle';
    }
  | {
      type: 'insertOval';
    }
  | {
      type: 'drawing';
      origin: Point;
      value: PageLayer;
    };

export type ApplicationState = {
  interactionState: InteractionState;
  selectedPage: string;
  selectedObjects: string[];
  sketch: SketchFile;
};

export type PageLayer = Sketch.Page['layers'][0];

type StyleElementType = 'Fill' | 'Border';

export type Action =
  | [type: 'addLayer', layer: PageLayer]
  | [type: 'selectLayer', layerId: string]
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
  | [type: 'interaction', state: InteractionState];

export function reducer(
  state: ApplicationState,
  action: Action,
): ApplicationState {
  switch (action[0]) {
    case 'addLayer': {
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (state) => {
        state.sketch.pages[pageIndex].layers.push(action[1]);
      });
    }
    case 'selectLayer': {
      return produce(state, (state) => {
        state.selectedObjects = [action[1]];
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
        state.interactionState = action[1];
      });
    }
  }
}

export function createInitialState(sketch: SketchFile): ApplicationState {
  if (sketch.pages.length === 0) {
    throw new Error('Invalid Sketch file - no pages');
  }

  return {
    interactionState: { type: 'none' },
    selectedPage: sketch.pages[0].do_objectID,
    selectedObjects: [],
    sketch,
  };
}
