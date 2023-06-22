import { CanvasKit } from 'canvaskit';
import Sketch from 'noya-file-format';
import type { ApplicationState } from './applicationReducer';
import { layerPropertyReducer } from './layerPropertyReducer';
import { symbolsReducer } from './symbolsReducer';

export type BlockContent = {
  blockText: string;
  normalizedText?: string;
  overrides?: Sketch.OverrideValue[];
  symbolId?: string;
};

export type OverriddenBlockContent = {
  layerId: string;
  blockContent: BlockContent;
};

export type BlockAction =
  | [type: 'setBlockContent', layerId: string, content: BlockContent];

export function blockReducer(
  state: ApplicationState,
  action: BlockAction,
  CanvasKit: CanvasKit,
): ApplicationState {
  switch (action[0]) {
    case 'setBlockContent': {
      const [, id, { blockText, normalizedText, overrides, symbolId }] = action;

      if (symbolId) {
        state = symbolsReducer(state, [
          'setSymbolInstanceSource',
          symbolId,
          'preserveCurrent',
        ]);
      }

      state = layerPropertyReducer(
        state,
        ['setBlockText', id, blockText, normalizedText],
        CanvasKit,
      );

      state = (overrides ?? []).reduce((result, override) => {
        return symbolsReducer(result, [
          'setOverrideValue',
          [id],
          override.overrideName,
          override.value,
        ]);
      }, state);

      return state;
    }
    default:
      return state;
  }
}
