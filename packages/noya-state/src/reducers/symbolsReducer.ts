import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { Layers } from '..';
import { getSelectedLayerIndexPaths } from '../selectors/indexPathSelectors';
import { getCurrentPage } from '../selectors/pageSelectors';
import { ApplicationState } from './applicationReducer';

export type SymbolsAction =
  | [type: 'setAdjustContentOnResize', value: boolean]
  | [type: 'setHasBackgroundColor', value: boolean]
  | [type: 'setBackgroundColor', value: Sketch.Color]
  | [type: 'setIncludeBackgroundColorInExport', value: boolean]
  | [type: 'setIncludeBackgroundColorInInstance', value: boolean];

export function symbolsReducer(
  state: ApplicationState,
  action: SymbolsAction,
): ApplicationState {
  switch (action[0]) {
    case 'setAdjustContentOnResize': {
      const [, value] = action;
      const page = getCurrentPage(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          page,
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.resizesContent = value;
      });
    }
    case 'setHasBackgroundColor': {
      const [, value] = action;
      const page = getCurrentPage(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          page,
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.hasBackgroundColor = value;
      });
    }
    case 'setBackgroundColor': {
      const [, value] = action;
      const page = getCurrentPage(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          page,
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.backgroundColor = value;
      });
    }
    case 'setIncludeBackgroundColorInExport': {
      const [, value] = action;
      const page = getCurrentPage(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          page,
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.includeBackgroundColorInExport = value;
      });
    }
    case 'setIncludeBackgroundColorInInstance': {
      const [, value] = action;
      const page = getCurrentPage(state);
      const indexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        const symbol = Layers.access(
          page,
          indexPaths[0],
        ) as Sketch.SymbolMaster;
        symbol.includeBackgroundColorInInstance = value;
      });
    }
    default:
      return state;
  }
}
