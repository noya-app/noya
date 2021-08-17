import { Paragraph, ShapedLine } from 'canvaskit';
import { Point } from 'noya-geometry';
import { clamp } from 'noya-utils';
import { normalizeRange } from '../selectors/attributedStringSelectors';

export type TextSelectionRange = {
  head: number;
  anchor: number;
  xPosition?: number;
};

export type TextEditorCursorDirection = 'forward' | 'backward';

export type TextEditorCursorUnit =
  | 'character'
  | 'word'
  | 'line'
  | 'all'
  | 'vertical';

export function getNextCursorRange(
  paragraph: Paragraph,
  string: string,
  range: TextSelectionRange,
  direction: TextEditorCursorDirection,
  unit: TextEditorCursorUnit,
  mode: 'move' | 'select',
): TextSelectionRange {
  const { anchor, head } = range;

  switch (mode) {
    case 'move': {
      const [min, max] = normalizeRange([head, anchor]);
      const currentIndex = direction === 'forward' ? max : min;

      // If we have a selected range and try to move by one `character`,
      // move to one side of the range
      if (unit === 'character' && head !== anchor) {
        return {
          anchor: currentIndex,
          head: currentIndex,
        };
      }

      const { index, xPosition } = getNextCursorPosition(
        paragraph,
        string,
        currentIndex,
        range.xPosition,
        direction,
        unit,
      );

      return {
        anchor: index,
        head: index,
        xPosition,
      };
    }
    case 'select': {
      const { index, xPosition } = getNextCursorPosition(
        paragraph,
        string,
        range.head,
        range.xPosition,
        direction,
        unit,
      );

      return {
        anchor,
        head: index,
        xPosition,
      };
    }
  }
}

const wordRe = new RegExp('[\\p{Alphabetic}\\p{Number}_]', 'u');

export function getNextCursorPosition(
  paragraph: Paragraph,
  string: string,
  currentIndex: number,
  xPosition: number | undefined,
  direction: TextEditorCursorDirection,
  unit: TextEditorCursorUnit,
): { index: number; xPosition?: number } {
  const head = currentIndex;
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

export function getGlyphCoordinatesForShapedLine(shapedLine: ShapedLine) {
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

export function getLineMetadata(paragraph: Paragraph) {
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

export type DeletionType =
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

export function getDeletionParametersForInputEvent(
  type: DeletionType,
): [TextEditorCursorDirection, TextEditorCursorUnit] {
  const direction: TextEditorCursorDirection = type.includes('Backward')
    ? 'backward'
    : 'forward';

  switch (type) {
    case 'deleteContent':
    case 'deleteContentForward':
    case 'deleteContentBackward':
      return [direction, 'character'];
    case 'deleteEntireSoftLine':
    case 'deleteHardLineBackward':
    case 'deleteSoftLineBackward':
    case 'deleteHardLineForward':
    case 'deleteSoftLineForward':
      return [direction, 'line'];
    case 'deleteWordBackward':
    case 'deleteWordForward':
      return [direction, 'word'];
  }
}
