import { CanvasKit, Paragraph, ShapedLine } from 'canvaskit';
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

        const { index, xPosition } = getNextCursorIndex(
          paragraph,
          draftLayer.attributedString.string,
          range,
          direction,
          unit,
        );

        const { anchor, head } = range;

        switch (type) {
          case 'moveCursor':
            // If we have a selected range, move to one side of it
            if (unit === 'character' && head !== anchor) {
              const [min, max] = normalizeRange([head, anchor]);
              const index = direction === 'forward' ? max : min;

              draft.selectedText.range = {
                anchor: index,
                head: index,
              };

              break;
            }

            draft.selectedText.range = {
              anchor: index,
              head: index,
              xPosition,
            };
            break;
          case 'moveTextSelection':
            draft.selectedText.range = {
              anchor,
              head: index,
              xPosition,
            };
            break;
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

function getNextCursorIndex(
  paragraph: Paragraph,
  string: string,
  selectionRange: TextSelectionRange,
  direction: TextEditorCursorDirection,
  unit: TextEditorCursorUnit,
): { index: number; xPosition?: number } {
  const { head, xPosition } = selectionRange;
  const directionMultiplier = direction === 'forward' ? 1 : -1;
  const length = string.length;

  switch (unit) {
    case 'character': {
      return { index: clamp(head + directionMultiplier, 0, length) };
    }
    case 'word':
      const currentWordBoundary = paragraph.getWordBoundary(head);

      let nextIndex =
        direction === 'forward'
          ? currentWordBoundary.end
          : currentWordBoundary.start;

      switch (direction) {
        case 'forward':
          while (nextIndex < length && !wordRe.test(string[nextIndex - 1])) {
            nextIndex = paragraph.getWordBoundary(nextIndex).end;
          }
          break;
        case 'backward':
          // The `start` may be the same as our current `head`, in which
          // case the cursor wouldn't move.
          if (nextIndex === head && head > 0) {
            nextIndex = paragraph.getWordBoundary(head - 1).start;
          }

          while (nextIndex > 0 && !wordRe.test(string[nextIndex])) {
            nextIndex = paragraph.getWordBoundary(nextIndex - 1).start;
          }
          break;
      }

      return { index: nextIndex };
    case 'line': {
      const metrics = paragraph.getLineMetrics();
      const current = metrics.find(
        (lm) => lm.startIndex <= head && head <= lm.endIndex,
      );

      if (!current) return { index: head };

      return {
        index: direction === 'forward' ? current.endIndex : current.startIndex,
      };
    }
    case 'all': {
      return { index: direction === 'forward' ? length : 0 };
    }
    case 'vertical': {
      const lineMetadata = getLineMetadata(paragraph);
      let metadataIndex = lineMetadata.findIndex(
        (m) => m.metrics.startIndex <= head && head <= m.metrics.endIndex,
      );

      if (metadataIndex === -1) {
        metadataIndex = lineMetadata.length - 1;
      }

      const metadata = lineMetadata[metadataIndex];
      const targetMetadata = lineMetadata[metadataIndex + directionMultiplier];

      // First or last line
      if (!targetMetadata) {
        switch (direction) {
          case 'backward':
            return { index: 0 };
          case 'forward':
            return { index: length };
        }
      }

      const shapedLine = metadata.shapedLine;

      // Use the previous xPosition if we have one
      let nextXPosition = xPosition;

      // If no previous xPosition, try to find the current xPosition
      if (nextXPosition === undefined && shapedLine) {
        const coordinates = getGlyphCoordinatesForShapedLine(shapedLine);
        const coordinate =
          coordinates[
            clamp(head - shapedLine.textRange.first, 0, coordinates.length - 1)
          ];
        nextXPosition = coordinate.x;
      }

      if (nextXPosition !== undefined) {
        return {
          index: paragraph.getGlyphPositionAtCoordinate(
            nextXPosition,
            targetMetadata.metrics.baseline,
          ).pos,
          xPosition: nextXPosition,
        };
      } else {
        return { index: targetMetadata.metrics.startIndex };
      }
    }
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

function getLineMetadata(paragraph: Paragraph) {
  const shapedLines = paragraph.getShapedLines();
  const lineMetrics = paragraph.getLineMetrics();

  return lineMetrics.map((metrics) => {
    return {
      metrics,
      shapedLine: shapedLines.find(
        (shapeLine) => shapeLine.textRange.first === metrics.startIndex,
      ),
    };
  });
}
