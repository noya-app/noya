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

        const nextIndex = getNextCursorIndex(
          paragraph,
          draftLayer.attributedString.string,
          range,
          direction,
          unit,
        );

        draft.selectedText.range = { anchor: nextIndex, head: nextIndex };
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
): number {
  const { head, anchor } = selectionRange;
  const directionMultiplier = direction === 'forward' ? 1 : -1;
  const length = string.length;

  switch (unit) {
    case 'character': {
      // If we have a selected range, move to one side of it
      if (head !== anchor) {
        const [min, max] = normalizeRange([head, anchor]);
        return direction === 'forward' ? max : min;
      }

      return clamp(head + directionMultiplier, 0, length);
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

      return nextIndex;
    case 'line': {
      const metrics = paragraph.getLineMetrics();
      const current = metrics.find(
        (lm) => lm.startIndex <= head && head <= lm.endIndex,
      );

      if (!current) return head;

      return direction === 'forward' ? current.endIndex : current.startIndex;
    }
    case 'all': {
      return direction === 'forward' ? length : 0;
    }
    case 'vertical': {
      const lineMetadata = getLineMetadata(paragraph);
      const metadataIndex = lineMetadata.findIndex(
        (m) => m.metrics.startIndex <= head && head <= m.metrics.endIndex,
      );
      const metadata = lineMetadata[metadataIndex];
      const targetMetadata = lineMetadata[metadataIndex + directionMultiplier];

      // First or last line
      if (!targetMetadata) {
        switch (direction) {
          case 'backward':
            return 0;
          case 'forward':
            return length;
        }
      }

      const shapedLine = metadata.shapedLine;

      if (shapedLine) {
        const coordinates = getGlyphCoordinatesForShapedLine(shapedLine);
        const coordinate = coordinates[head - shapedLine.textRange.first];

        return paragraph.getGlyphPositionAtCoordinate(
          coordinate.x,
          targetMetadata.metrics.baseline,
        ).pos;
      } else {
        return targetMetadata.metrics.startIndex;
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
