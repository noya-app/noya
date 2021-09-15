import Sketch from 'noya-file-format';
import produce from 'immer';
import {
  ApplicationReducerContext,
  getLayerParagraph,
  GroupLayouts,
  Layers,
  SetNumberMode,
} from '..';
import { getSelectedLayers } from '../selectors/layerSelectors';
import { getSelectedSymbols, getSymbols } from '../selectors/themeSelectors';
import { ApplicationState } from './applicationReducer';
import { CanvasKit } from 'canvaskit';

export type SymbolsAction =
  | [type: 'setAdjustContentOnResize', value: boolean]
  | [type: 'setHasBackgroundColor', value: boolean]
  | [type: 'setBackgroundColor', value: Sketch.Color]
  | [type: 'setIncludeBackgroundColorInExport', value: boolean]
  | [type: 'setIncludeBackgroundColorInInstance', value: boolean]
  | [type: 'setLayoutAxis', value: Sketch.InferredLayoutAxis | undefined]
  | [type: 'setLayoutAnchor', value: Sketch.InferredLayoutAnchor]
  | [type: 'setLayoutAnchor', value: Sketch.InferredLayoutAnchor]
  | [type: 'setMinSize', amount: number | undefined, type: SetNumberMode]
  | [type: 'setAllowsOverrides', value: boolean]
  | [type: 'onSetOverrideProperty', overrideName: string, value: boolean]
  | [type: 'setInstanceSymbolSource', symbolId: string]
  | [type: 'goToSymbolSource', overrideName: string]
  | [type: 'setOverrideValue', overrideName?: string, value?: string];

export function symbolsReducer(
  state: ApplicationState,
  action: SymbolsAction,
  CanvasKit: CanvasKit,
  context: ApplicationReducerContext,
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
    case 'setMinSize': {
      const [, amount, type = 'replace'] = action;

      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          if (
            !symbol.groupLayout ||
            !GroupLayouts.isInferredLayout(symbol.groupLayout)
          )
            return;

          if (!amount) {
            symbol.groupLayout.minSize = undefined;
            return;
          }

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
    case 'onSetOverrideProperty': {
      const [, name, value] = action;

      return produce(state, (draft) => {
        const symbols = getSelectedSymbols(draft);

        symbols.forEach((symbol) => {
          const override = symbol.overrideProperties.find(
            (property) => property.overrideName === name,
          );

          if (!override) {
            symbol.overrideProperties.push({
              _class: 'MSImmutableOverrideProperty',
              overrideName: name,
              canOverride: value,
            });
            return;
          }
          override.canOverride = value;
        });
      });
    }
    case 'setInstanceSymbolSource': {
      const [, symbolId] = action;

      const symbolMaster = getSymbols(state).find(
        (symbol) => symbol.symbolID === symbolId,
      );

      return produce(state, (draft) => {
        const symbols = getSelectedLayers(draft).filter(
          Layers.isSymbolInstance,
        );

        if (!symbolMaster) return;
        symbols.forEach((symbol) => {
          symbol.frame = {
            ...symbol.frame,
            width: symbolMaster.frame.width,
            height: symbolMaster.frame.height,
          };
          symbol.symbolID = symbolId;
        });
      });
    }
    case 'goToSymbolSource': {
      const [, symbolId] = action;

      const symbolMaster = getSymbols(state).find(
        (symbol) => symbol.symbolID === symbolId,
      );

      return produce(state, (draft) => {
        if (!symbolMaster) return;

        const page = draft.sketch.pages.find((p) =>
          p.layers.some((l) => l.do_objectID === symbolMaster.do_objectID),
        );
        if (!page) return;

        draft.selectedPage = page.do_objectID;
        draft.selectedLayerIds = [symbolMaster.do_objectID];
      });
    }
    case 'setOverrideValue': {
      const [, name, value] = action;

      return produce(state, (draft) => {
        const symbols = getSelectedLayers(draft).filter(
          Layers.isSymbolInstance,
        );

        symbols.forEach((symbol) => {
          if (!name) {
            symbol.overrideValues = [];
            return;
          }

          const overrideValueIndex = symbol.overrideValues.findIndex(
            (property) => property.overrideName === name,
          );

          if (overrideValueIndex !== -1) {
            if (value === undefined) {
              symbol.overrideValues.splice(overrideValueIndex, 1);
            } else {
              symbol.overrideValues[overrideValueIndex].value = value;
            }
          } else if (value !== undefined) {
            symbol.overrideValues.push({
              _class: 'overrideValue',
              overrideName: name,
              value: value,
            });
          }

          // SmartLayout
          if (name.includes('stringValue')) {
            const symbolMaster = getSymbols(state).find(
              (symbolMaster) => symbolMaster.symbolID === symbol.symbolID,
            );

            if (
              !symbolMaster ||
              !symbolMaster.groupLayout ||
              !GroupLayouts.isInferredLayout(symbolMaster.groupLayout)
            )
              return;

            const layerId = name.split('_')[0];
            const overridedTextLayer = Layers.findInArray(
              symbolMaster.layers,
              (layer) => layer.do_objectID === layerId,
            ) as Sketch.Text;

            if (!overridedTextLayer) return;

            const copyTextLayer = produce(overridedTextLayer, (layer) => {
              layer.attributedString.string = value
                ? value
                : layer.attributedString.string;
              layer.frame.width = Number.MAX_VALUE;
            });

            const paragraph = getLayerParagraph(
              CanvasKit,
              context.fontManager,
              copyTextLayer,
            );

            const { axis, layoutAnchor, minSize } = symbolMaster.groupLayout;

            if (
              axis === Sketch.InferredLayoutAxis.Horizontal &&
              overridedTextLayer.textBehaviour === Sketch.TextBehaviour.Flexible
            ) {
              if (minSize !== undefined) {
                symbol.frame = {
                  ...symbol.frame,
                  width: minSize,
                };

                return;
              }

              const paddingLeft = overridedTextLayer.frame.x;
              const paddingRight =
                symbolMaster.frame.width -
                (overridedTextLayer.frame.width + paddingLeft);

              symbol.frame = {
                ...symbol.frame,
                width: paragraph.getMaxWidth() + paddingLeft + paddingRight,
              };

              if (layoutAnchor === Sketch.InferredLayoutAnchor.Middle) {
                symbol.frame = {
                  ...symbol.frame,
                  x: symbol.frame.x,
                };
              } else if (layoutAnchor === Sketch.InferredLayoutAnchor.Max) {
                symbol.frame = {
                  ...symbol.frame,
                  x: symbol.frame.x,
                };
              }
            } else if (
              overridedTextLayer.textBehaviour === Sketch.TextBehaviour.Fixed
            ) {
              if (minSize !== undefined) {
                symbol.frame = {
                  ...symbol.frame,
                  height: minSize,
                };
                return;
              }
              const paddingTop = overridedTextLayer.frame.y;
              const paddingBottom =
                symbolMaster.frame.height -
                overridedTextLayer.frame.height +
                paddingTop;

              symbol.frame = {
                ...symbol.frame,
                height: paragraph.getHeight() + paddingTop + paddingBottom,
              };

              if (layoutAnchor === Sketch.InferredLayoutAnchor.Middle) {
                symbol.frame = {
                  ...symbol.frame,
                  y: symbol.frame.y,
                };
              } else if (layoutAnchor === Sketch.InferredLayoutAnchor.Max) {
                symbol.frame = {
                  ...symbol.frame,
                  y: symbol.frame.y,
                };
              }
            }
          } else if (name.includes('symbolID')) {
            const symbolMaster = getSymbols(state).find(
              (symbolMaster) => symbolMaster.symbolID === symbol.symbolID,
            );

            if (!symbolMaster) return;

            const layerId = name.split('_')[0];

            const overridedSymbolLayer = Layers.findInArray(
              symbolMaster.layers,
              (layer) => layer.do_objectID === layerId,
            ) as Sketch.SymbolInstance;

            if (!overridedSymbolLayer) return;

            // change position of symbol to the rigth / left to move to current x.
            /*
            if (value === 'none') {
              symbol.frame = {
                ...symbol.frame,
                width: symbol.frame.width - overridedSymbolLayer.frame.width,
              };
            } else {
              symbol.frame = {
                ...symbol.frame,
                width: symbol.frame.width + overridedSymbolLayer.frame.width,
              };
            }*/
          }
        });
      });
    }
    default:
      return state;
  }
}
