import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { Layers } from '..';
import { getSelectedLayerIndexPaths } from '../selectors/indexPathSelectors';
import { getCurrentPageIndex } from '../selectors/pageSelectors';
import { ApplicationState } from './applicationReducer';

export type SymbolsAction =
  | [type: 'setAdjustContentOnResize', value: boolean]
  | [type: 'setHasBackgroundColor', value: boolean]
  | [type: 'setBackgroundColor', value: Sketch.Color]
  | [type: 'setIncludeBackgroundColorInExport', value: boolean]
  | [type: 'setIncludeBackgroundColorInInstance', value: boolean]
  | [type: 'setGroupLayout', value: Sketch.InferredLayoutAxis | undefined]
  | [type: 'setLayoutAnchor', value: Sketch.InferredLayoutAnchor]
  | [type: 'setLayoutAnchor', value: Sketch.InferredLayoutAnchor]
  | [type: 'setMinWidth', value: number];
export function symbolsReducer(
  state: ApplicationState,
  action: SymbolsAction,
): ApplicationState {
  switch (action[0]) {
    case 'setAdjustContentOnResize': {
      const [, value] = action;
      const index = getCurrentPageIndex(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          draft.sketch.pages[index],
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.resizesContent = value;
      });
    }
    case 'setHasBackgroundColor': {
      const [, value] = action;
      const index = getCurrentPageIndex(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          draft.sketch.pages[index],
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.hasBackgroundColor = value;
      });
    }
    case 'setBackgroundColor': {
      const [, value] = action;
      const index = getCurrentPageIndex(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          draft.sketch.pages[index],
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.backgroundColor = value;
      });
    }
    case 'setIncludeBackgroundColorInExport': {
      const [, value] = action;
      const index = getCurrentPageIndex(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          draft.sketch.pages[index],
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.includeBackgroundColorInExport = value;
      });
    }
    case 'setIncludeBackgroundColorInInstance': {
      const [, value] = action;
      const index = getCurrentPageIndex(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          draft.sketch.pages[index],
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.includeBackgroundColorInInstance = value;
      });
    }
    case 'setGroupLayout': {
      const [, value] = action;
      const index = getCurrentPageIndex(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          draft.sketch.pages[index],
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.groupLayout =
          value === undefined || Number.isNaN(value)
            ? { _class: 'MSImmutableFreeformGroupLayout' }
            : {
                _class: 'MSImmutableInferredGroupLayout',
                axis: value,
                layoutAnchor:
                  symbol.groupLayout &&
                  symbol.groupLayout._class === 'MSImmutableInferredGroupLayout'
                    ? symbol.groupLayout.layoutAnchor
                    : Sketch.InferredLayoutAnchor.Min,
              };
      });
    }
    case 'setLayoutAnchor': {
      const [, value] = action;
      const index = getCurrentPageIndex(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          draft.sketch.pages[index],
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        if (
          !symbol.groupLayout ||
          symbol.groupLayout._class === 'MSImmutableFreeformGroupLayout'
        )
          return;

        symbol.groupLayout.layoutAnchor = value;
      });
    }
    case 'setMinWidth': {
      const [, value] = action;
      const index = getCurrentPageIndex(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          draft.sketch.pages[index],
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        if (
          !symbol.groupLayout ||
          symbol.groupLayout._class === 'MSImmutableFreeformGroupLayout'
        )
          return;

        symbol.groupLayout.minSize = value;
      });
    }
    default:
      return state;
  }
}
