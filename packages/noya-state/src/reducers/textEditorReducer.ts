import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import {
  Layers,
  Selectors,
  TextEditorCursorDirection,
  TextEditorCursorUnit,
  TextSelectionRange,
} from 'noya-state';
import { UUID } from '../types';
import {
  ApplicationReducerContext,
  ApplicationState,
} from './applicationReducer';
import { interactionReducer } from './interactionReducer';

export type TextEditorAction =
  | [type: 'setTextSelection', range: TextSelectionRange]
  | [type: 'selectAllText', layerId?: UUID]
  | [
      type: 'selectContainingText',
      layerId: UUID,
      index: number,
      unit: 'word' | 'line',
    ]
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
        if (!Selectors.hasTextSelection(draft.interactionState)) return;

        draft.interactionState.range = range;
      });
    }
    case 'selectAllText': {
      const [, layerId] = action;

      const id = layerId ?? Selectors.getTextSelection(state)?.layerId;

      if (id === undefined) return state;

      const layer = Layers.find(
        Selectors.getCurrentPage(state),
        (layer) => layer.do_objectID === id,
      );

      if (!layer || !Layers.isTextLayer(layer)) return state;

      return produce(state, (draft) => {
        draft.interactionState = interactionReducer(draft.interactionState, [
          'editingText',
          id,
          { anchor: 0, head: layer.attributedString.string.length },
        ]);
      });
    }
    case 'selectContainingText': {
      const [, layerId, index, unit] = action;

      const pageIndex = Selectors.getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        Selectors.getCurrentPage(state),
        (layer) => layer.do_objectID === layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
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

            draft.interactionState = interactionReducer(
              draft.interactionState,
              [
                'editingText',
                layerId,
                {
                  anchor: boundary.start,
                  head: boundary.end,
                },
              ],
            );

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

            draft.interactionState = interactionReducer(
              draft.interactionState,
              [
                'editingText',
                layerId,
                {
                  anchor: backwardIndex,
                  head: forwardIndex,
                },
              ],
            );

            break;
          }
        }
      });
    }
    case 'moveTextSelection':
    case 'moveCursor': {
      const [type, direction, unit] = action;

      const selectedText = Selectors.getTextSelection(state);

      if (!selectedText) return state;

      const { layerId, range } = selectedText;
      const pageIndex = Selectors.getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        Selectors.getCurrentPage(state),
        (layer) => layer.do_objectID === layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
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

        const newRange = Selectors.getNextCursorRange(
          paragraph,
          draftLayer.attributedString.string,
          range,
          direction,
          unit,
          type === 'moveCursor' ? 'move' : 'select',
        );

        draft.interactionState = interactionReducer(draft.interactionState, [
          'editingText',
          layerId,
          newRange,
        ]);
      });
    }
    case 'insertText': {
      const [, text] = action;

      const selectedText = Selectors.getTextSelection(state);

      if (!selectedText) return state;

      const { layerId, range } = selectedText;
      const pageIndex = Selectors.getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        Selectors.getCurrentPage(state),
        (layer) => layer.do_objectID === layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
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
        draft.interactionState = interactionReducer(draft.interactionState, [
          'editingText',
          layerId,
          newRange,
        ]);
      });
    }
    case 'deleteText': {
      const [, direction, unit] = action;

      const selectedText = Selectors.getTextSelection(state);

      if (!selectedText) return state;

      const { layerId, range } = selectedText;
      const pageIndex = Selectors.getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        Selectors.getCurrentPage(state),
        (layer) => layer.do_objectID === layerId,
      );

      if (!indexPath) return state;

      return produce(state, (draft) => {
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
          draft.interactionState = interactionReducer(draft.interactionState, [
            'editingText',
            layerId,
            newRange,
          ]);
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
          draft.interactionState = interactionReducer(draft.interactionState, [
            'editingText',
            layerId,
            newRange,
          ]);
        }
      });
    }
    default:
      return state;
  }
}
