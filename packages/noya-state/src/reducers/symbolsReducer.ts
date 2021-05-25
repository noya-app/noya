import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { getSymbols } from '../selectors/themeSelectors';
import { getCurrentTab } from '../selectors/workspaceSelectors';
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
  | [type: 'setMinWidth', value: number]
  | [type: 'setAllowsOverride', value: boolean];
export function symbolsReducer(
  state: ApplicationState,
  action: SymbolsAction,
): ApplicationState {
  switch (action[0]) {
    case 'setAdjustContentOnResize': {
      const [, value] = action;
      const filter =
        getCurrentTab(state) === 'canvas'
          ? state.selectedObjects
          : state.selectedSymbolsIds;

      return produce(state, (draft) => {
        const symbol = getSymbols(draft).filter((symbol) =>
          filter.includes(symbol.do_objectID),
        )[0];
        symbol.resizesContent = value;
      });
    }
    case 'setHasBackgroundColor': {
      const [, value] = action;
      const filter =
        getCurrentTab(state) === 'canvas'
          ? state.selectedObjects
          : state.selectedSymbolsIds;

      return produce(state, (draft) => {
        const symbol = getSymbols(draft).filter((symbol) =>
          filter.includes(symbol.do_objectID),
        )[0];
        symbol.hasBackgroundColor = value;
      });
    }
    case 'setBackgroundColor': {
      const [, value] = action;
      const filter =
        getCurrentTab(state) === 'canvas'
          ? state.selectedObjects
          : state.selectedSymbolsIds;

      return produce(state, (draft) => {
        const symbol = getSymbols(draft).filter((symbol) =>
          filter.includes(symbol.do_objectID),
        )[0];
        symbol.backgroundColor = value;
      });
    }
    case 'setIncludeBackgroundColorInExport': {
      const [, value] = action;
      const filter =
        getCurrentTab(state) === 'canvas'
          ? state.selectedObjects
          : state.selectedSymbolsIds;

      return produce(state, (draft) => {
        const symbol = getSymbols(draft).filter((symbol) =>
          filter.includes(symbol.do_objectID),
        )[0];
        symbol.includeBackgroundColorInExport = value;
      });
    }
    case 'setIncludeBackgroundColorInInstance': {
      const [, value] = action;
      const filter =
        getCurrentTab(state) === 'canvas'
          ? state.selectedObjects
          : state.selectedSymbolsIds;

      return produce(state, (draft) => {
        const symbol = getSymbols(draft).filter((symbol) =>
          filter.includes(symbol.do_objectID),
        )[0];
        symbol.includeBackgroundColorInInstance = value;
      });
    }
    case 'setGroupLayout': {
      const [, value] = action;
      const filter =
        getCurrentTab(state) === 'canvas'
          ? state.selectedObjects
          : state.selectedSymbolsIds;

      return produce(state, (draft) => {
        const symbol = getSymbols(draft).filter((symbol) =>
          filter.includes(symbol.do_objectID),
        )[0];
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
      const filter =
        getCurrentTab(state) === 'canvas'
          ? state.selectedObjects
          : state.selectedSymbolsIds;

      return produce(state, (draft) => {
        const symbol = getSymbols(draft).filter((symbol) =>
          filter.includes(symbol.do_objectID),
        )[0];
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
      const filter =
        getCurrentTab(state) === 'canvas'
          ? state.selectedObjects
          : state.selectedSymbolsIds;

      return produce(state, (draft) => {
        const symbol = getSymbols(draft).filter((symbol) =>
          filter.includes(symbol.do_objectID),
        )[0];
        if (
          !symbol.groupLayout ||
          symbol.groupLayout._class === 'MSImmutableFreeformGroupLayout'
        )
          return;

        symbol.groupLayout.minSize = value;
      });
    }
    case 'setAllowsOverride': {
      const [, value] = action;
      const filter =
        getCurrentTab(state) === 'canvas'
          ? state.selectedObjects
          : state.selectedSymbolsIds;

      return produce(state, (draft) => {
        const symbol = getSymbols(draft).filter((symbol) =>
          filter.includes(symbol.do_objectID),
        )[0];
        symbol.allowsOverrides = value;
      });
    }
    default:
      return state;
  }
}
