import { CanvasKit, ShapedLine } from 'canvaskit';
import produce from 'immer';
import { Point } from 'noya-geometry';
import { Layers, MAX_TEXT_LAYER_STRING_LENGTH, Selectors } from 'noya-state';
import { clamp } from 'noya-utils';
import { normalizeRange } from '../selectors/attributedStringSelectors';
import {
  ApplicationReducerContext,
  ApplicationState,
  TextSelectionRange,
} from './applicationReducer';

export type TextEditorCursorDirection = 'forward' | 'backward';

export type TextEditorCursorUnit =
  | 'character'
  | 'word'
  | 'line'
  | 'all'
  | 'vertical';

const wordRe = new RegExp('[\\p{Alphabetic}\\p{Number}_]', 'u');

export type TextEditorAction =
  | [type: 'setTextSelection', range: TextSelectionRange]
  | [type: 'selectAllText']
  | [
      type: 'moveCursor',
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
    case 'moveCursor': {
      const [, direction, unit] = action;

      if (!state.selectedText) return state;

      const {
        layerId,
        range: { head, anchor },
      } = state.selectedText;
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

        const directionMultiplier = direction === 'forward' ? 1 : -1;
        const string = draftLayer.attributedString.string;
        const length = string.length;

        const paragraph = Selectors.getLayerParagraph(
          CanvasKit,
          context.fontManager,
          draftLayer,
        );

        switch (unit) {
          case 'character': {
            // If we have a selected range, move to one side of it
            if (head !== anchor) {
              const [min, max] = normalizeRange([head, anchor]);
              const nextIndex = direction === 'forward' ? max : min;
              draft.selectedText.range = { anchor: nextIndex, head: nextIndex };
              break;
            }

            const nextIndex = clamp(head + directionMultiplier, 0, length);
            draft.selectedText.range = { anchor: nextIndex, head: nextIndex };
            break;
          }
          case 'word':
            const currentWordBoundary = paragraph.getWordBoundary(head);

            let nextIndex =
              direction === 'forward'
                ? currentWordBoundary.end
                : currentWordBoundary.start;

            // The `start` may be the same as our current `head`, in which
            // case the cursor wouldn't move.
            if (direction === 'backward' && nextIndex === head && head > 0) {
              nextIndex = paragraph.getWordBoundary(head - 1).start;
            }

            switch (direction) {
              case 'forward':
                while (
                  nextIndex < length &&
                  !wordRe.test(string[nextIndex - 1])
                ) {
                  nextIndex = paragraph.getWordBoundary(nextIndex).end;
                }
                break;
              case 'backward':
                while (nextIndex > 0 && !wordRe.test(string[nextIndex])) {
                  nextIndex = paragraph.getWordBoundary(nextIndex - 1).start;
                }
                break;
            }

            draft.selectedText.range = { anchor: nextIndex, head: nextIndex };
            break;
          case 'line': {
            const metrics = paragraph.getLineMetrics();
            const current = metrics.find(
              (lm) => lm.startIndex <= head && head <= lm.endIndex,
            );

            if (!current) break;

            const nextIndex =
              direction === 'forward' ? current.endIndex : current.startIndex;
            draft.selectedText.range = { anchor: nextIndex, head: nextIndex };
            break;
          }
          case 'all': {
            const nextIndex = direction === 'forward' ? length : 0;
            draft.selectedText.range = { anchor: nextIndex, head: nextIndex };
            break;
          }
          case 'vertical': {
            const shapedLines = paragraph.getShapedLines();

            const shapedLine = shapedLines.find(
              (s) => s.textRange.first <= head && head <= s.textRange.last,
            );
            // console.log(shapedLine);

            if (shapedLine) {
              const coordinates = getGlyphCoordinatesForShapedLine(shapedLine);
              const coordinate = coordinates[head - shapedLine.textRange.first];

              const nextIndex = paragraph.getGlyphPositionAtCoordinate(
                coordinate.x,
                // TODO: Instead of 1, can we use the line metrics to find the actual y pos?
                direction === 'forward'
                  ? shapedLine.bottom + 1
                  : shapedLine.top - 1,
              ).pos;

              draft.selectedText.range = { anchor: nextIndex, head: nextIndex };

              // console.log(newPosition);
            } else {
              switch (direction) {
                case 'forward': {
                  const shapedLine = shapedLines.find(
                    (s) => head <= s.textRange.last,
                  );

                  const nextIndex = shapedLine
                    ? shapedLine.textRange.first
                    : length;

                  draft.selectedText.range = {
                    anchor: nextIndex,
                    head: nextIndex,
                  };

                  break;
                }
                case 'backward': {
                  const shapedLine = [...shapedLines]
                    .reverse()
                    .find((s) => s.textRange.first <= head);

                  const nextIndex = shapedLine ? shapedLine.textRange.first : 0;

                  draft.selectedText.range = {
                    anchor: nextIndex,
                    head: nextIndex,
                  };

                  break;
                }
              }
            }
          }
        }
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

function getGlyphCoordinatesForShapedLine(shapedLine: ShapedLine) {
  const coordinates: Point[] = [];

  // TODO: Consider all runs
  shapedLine.runs[0].positions.forEach((value, index) => {
    if (index % 2 === 0) {
      coordinates.push({ x: value, y: 0 });
    } else {
      coordinates[coordinates.length - 1].y = value;
    }
  });

  return coordinates;
}
