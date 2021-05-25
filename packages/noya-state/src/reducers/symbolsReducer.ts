import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { GroupLayouts, SetNumberMode } from '..';
import { getSelectedSymbols } from '../selectors/themeSelectors';
import { ApplicationState } from './applicationReducer';

export type SymbolsAction =
  | [type: 'setAdjustContentOnResize', value: boolean]
  | [type: 'setHasBackgroundColor', value: boolean]
  | [type: 'setBackgroundColor', value: Sketch.Color]
  | [type: 'setIncludeBackgroundColorInExport', value: boolean]
  | [type: 'setIncludeBackgroundColorInInstance', value: boolean]
  | [type: 'setLayoutAxis', value: Sketch.InferredLayoutAxis | undefined]
  | [type: 'setLayoutAnchor', value: Sketch.InferredLayoutAnchor]
  | [type: 'setLayoutAnchor', value: Sketch.InferredLayoutAnchor]
  | [type: 'setMinWidth', amount: number, type: SetNumberMode]
  | [type: 'setAllowsOverrides', value: boolean];
export function symbolsReducer(
  state: ApplicationState,
  action: SymbolsAction,
): ApplicationState {
  switch (action[0]) {
    case 'setAdjustContentOnResize': {
      const [, value] = action;

      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          symbol.resizesContent = value;
        });
      });
    }
    case 'setHasBackgroundColor': {
      const [, value] = action;

      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          symbol.hasBackgroundColor = value;
        });
      });
    }
    case 'setBackgroundColor': {
      const [, value] = action;
      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          symbol.backgroundColor = value;
        });
      });
    }
    case 'setIncludeBackgroundColorInExport': {
      const [, value] = action;

      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          symbol.includeBackgroundColorInExport = value;
        });
      });
    }
    case 'setIncludeBackgroundColorInInstance': {
      const [, value] = action;

      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          symbol.includeBackgroundColorInInstance = value;
        });
      });
    }
    case 'setLayoutAxis': {
      const [, value] = action;
      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          symbol.groupLayout =
            value === undefined
              ? { _class: 'MSImmutableFreeformGroupLayout' }
              : {
                  _class: 'MSImmutableInferredGroupLayout',
                  axis: value,
                  layoutAnchor:
                    symbol.groupLayout &&
                    GroupLayouts.isInferredLayout(symbol.groupLayout)
                      ? symbol.groupLayout.layoutAnchor
                      : Sketch.InferredLayoutAnchor.Min,
                };
        });
      });
    }
    case 'setLayoutAnchor': {
      const [, value] = action;

      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          if (
            !symbol.groupLayout ||
            !GroupLayouts.isInferredLayout(symbol.groupLayout)
          )
            return;

          symbol.groupLayout.layoutAnchor = value;
        });
      });
    }
    case 'setMinWidth': {
      const [, amount, type = 'replace'] = action;

      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          if (
            !symbol.groupLayout ||
            !GroupLayouts.isInferredLayout(symbol.groupLayout)
          )
            return;

          const value = symbol.groupLayout.minSize || 0;
          symbol.groupLayout.minSize =
            type === 'replace' ? amount : value + amount;
        });
      });
    }
    case 'setAllowsOverrides': {
      const [, value] = action;

      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          symbol.allowsOverrides = value;
        });
      });
    }
    default:
      return state;
  }
}
