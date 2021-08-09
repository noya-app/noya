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
  | [type: 'selectContainingText', index: number, unit: 'word' | 'line']
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
  | [
      type: 'deleteText',
      direction: TextEditorCursorDirection,
      unit: TextEditorCursorUnit,
    ];

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
    case 'selectContainingText': {
      const [, index, unit] = action;

      if (!state.selectedText) return state;

      const { layerId } = state.selectedText;
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

        switch (unit) {
          case 'word': {
            const boundary = paragraph.getWordBoundary(index);

            draft.selectedText.range = {
              anchor: boundary.start,
              head: boundary.end,
            };

            break;
          }
          case 'line': {
            const backwardIndex = Selectors.getNextCursorPosition(
              paragraph,
              draftLayer.attributedString.string,
              index,
              undefined,
              'backward',
              unit,
            ).index;

            const forwardIndex = Selectors.getNextCursorPosition(
              paragraph,
              draftLayer.attributedString.string,
              index,
              undefined,
              'forward',
              unit,
            ).index;

            draft.selectedText.range = {
              anchor: backwardIndex,
              head: forwardIndex,
            };

            break;
          }
        }
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
          Selectors.getEncodedStringAttributes(draftLayer.style),
        );

        draftLayer.attributedString = attributedString;
        draft.selectedText.range = newRange;
      });
    }
    case 'deleteText': {
      const [, direction, unit] = action;

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
            Selectors.getEncodedStringAttributes(draftLayer.style),
          );

          draftLayer.attributedString = attributedString;
          draft.selectedText.range = newRange;
        } else {
          const paragraph = Selectors.getLayerParagraph(
            CanvasKit,
            context.fontManager,
            draftLayer,
          );

          const position = Selectors.getNextCursorPosition(
            paragraph,
            draftLayer.attributedString.string,
            head,
            undefined,
            direction,
            unit,
          );

          const {
            attributedString,
            range: newRange,
          } = Selectors.replaceTextAndUpdateSelectionRange(
            draftLayer.attributedString,
            { head: position.index, anchor: head },
            '',
            Selectors.getEncodedStringAttributes(draftLayer.style),
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
