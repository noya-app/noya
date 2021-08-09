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

type DeletionType =
  | 'deleteContent'
  | 'deleteContentForward'
  | 'deleteContentBackward'
  | 'deleteEntireSoftLine'
  | 'deleteHardLineBackward'
  | 'deleteSoftLineBackward'
  | 'deleteHardLineForward'
  | 'deleteSoftLineForward'
  | 'deleteWordBackward'
  | 'deleteWordForward';

function getDeletionUnit(type: DeletionType): TextEditorCursorUnit {
  switch (type) {
    case 'deleteContent':
    case 'deleteContentForward':
    case 'deleteContentBackward':
      return 'character';
    case 'deleteEntireSoftLine':
    case 'deleteHardLineBackward':
    case 'deleteSoftLineBackward':
    case 'deleteHardLineForward':
    case 'deleteSoftLineForward':
      return 'line';
    case 'deleteWordBackward':
    case 'deleteWordForward':
      return 'word';
  }
}

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
  | [type: 'insertText', text: string]
  | [type: 'deleteText', type: DeletionType];

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

        const {
          attributedString,
          range: newRange,
        } = Selectors.replaceTextAndUpdateSelectionRange(
          draftLayer.attributedString,
          range,
          text,
        );

        draftLayer.attributedString = attributedString;
        draft.selectedText.range = newRange;
      });
    }
    case 'deleteText': {
      const [, deletionType] = action;

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

        const { head, anchor } = range;

        // If we have a selected range, delete that range
        if (head !== anchor) {
          const {
            attributedString,
            range: newRange,
          } = Selectors.replaceTextAndUpdateSelectionRange(
            draftLayer.attributedString,
            range,
            '',
          );

          draftLayer.attributedString = attributedString;
          draft.selectedText.range = newRange;
        } else {
          const paragraph = Selectors.getLayerParagraph(
            CanvasKit,
            context.fontManager,
            draftLayer,
          );

          const position = Selectors.getNextCursorIndex(
            paragraph,
            draftLayer.attributedString.string,
            head,
            undefined,
            deletionType.includes('Backward') ? 'backward' : 'forward',
            getDeletionUnit(deletionType),
          );

          const {
            attributedString,
            range: newRange,
          } = Selectors.replaceTextAndUpdateSelectionRange(
            draftLayer.attributedString,
            { head: position.index, anchor: head },
            '',
          );

          draftLayer.attributedString = attributedString;
          draft.selectedText.range = newRange;
        }
      });
    }
    default:
      return state;
  }
}
