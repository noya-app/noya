import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import {
  Layers,
  MAX_TEXT_LAYER_STRING_LENGTH,
  Selectors,
  TextEditorCursorDirection,
  TextEditorCursorUnit,
  TextSelectionRange,
} from 'noya-state';
import {
  ApplicationReducerContext,
  ApplicationState,
} from './applicationReducer';

export type TextEditorAction =
  | [type: 'setTextSelection', range: TextSelectionRange]
  | [type: 'selectAllText']
  | [
      type: 'moveCursor',
      direction: TextEditorCursorDirection,
      unit: TextEditorCursorUnit,
    ]
  | [
      type: 'moveTextSelection',
      direction: TextEditorCursorDirection,
      unit: TextEditorCursorUnit,
    ]
  | [type: 'insertText', text: string];

export function textEditorReducer(
  state: ApplicationState,
  action: TextEditorAction,
  CanvasKit: CanvasKit,
  context: ApplicationReducerContext,
): ApplicationState {
  switch (action[0]) {
    case 'setTextSelection': {
      const [, range] = action;

      return produce(state, (draft) => {
        if (!draft.selectedText) return;

        draft.selectedText.range = range;
      });
    }
    case 'selectAllText': {
      return produce(state, (draft) => {
        if (!draft.selectedText) return;

        draft.selectedText = {
          layerId: draft.selectedText.layerId,
          range: {
            anchor: 0,
            head: MAX_TEXT_LAYER_STRING_LENGTH,
          },
        };
      });
    }
    case 'moveTextSelection':
    case 'moveCursor': {
      const [type, direction, unit] = action;

      if (!state.selectedText) return state;

      const { layerId, range } = state.selectedText;
      const pageIndex = Selectors.getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        Selectors.getCurrentPage(state),
        (layer) => layer.do_objectID === layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
        if (!draft.selectedText) return;

        const draftLayer = Layers.access(
          draft.sketch.pages[pageIndex],
          indexPath,
        );

        if (!Layers.isTextLayer(draftLayer)) return;

        const paragraph = Selectors.getLayerParagraph(
          CanvasKit,
          context.fontManager,
          draftLayer,
        );

        draft.selectedText.range = Selectors.getNextCursorRange(
          paragraph,
          draftLayer.attributedString.string,
          range,
          direction,
          unit,
          type === 'moveCursor' ? 'move' : 'select',
        );
      });
    }
    case 'insertText': {
      const [, text] = action;

      if (!state.selectedText) return state;

      const { layerId, range } = state.selectedText;
      const pageIndex = Selectors.getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        Selectors.getCurrentPage(state),
        (layer) => layer.do_objectID === layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
        if (!draft.selectedText) return;

        const draftLayer = Layers.access(
          draft.sketch.pages[pageIndex],
          indexPath,
        );

        if (!Layers.isTextLayer(draftLayer)) return;

        draftLayer.attributedString = Selectors.replaceTextInRange(
          draftLayer.attributedString,
          [range.anchor, range.head],
          text,
        );

        const location = Math.min(range.anchor, range.head) + text.length;

        draft.selectedText.range = { anchor: location, head: location };
      });
    }
    default:
      return state;
  }
}
