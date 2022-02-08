import {
  FlattenedRectangleArray,
  LineMetrics,
  Paragraph,
  PositionWithAffinity,
  RectHeightStyle,
  RectWidthStyle,
  ShapedLine,
  URange,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';

export class JSParagraph extends JSEmbindObject implements Paragraph {
  didExceedMaxLines(): boolean {
    throw new Error('Not implemented');
  }

  getAlphabeticBaseline(): number {
    throw new Error('Not implemented');
  }

  getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
    throw new Error('Not implemented');
  }

  getHeight(): number {
    return 0;
    // throw new Error('Not implemented');
  }

  getIdeographicBaseline(): number {
    throw new Error('Not implemented');
  }

  getLineMetrics(): LineMetrics[] {
    throw new Error('Not implemented');
  }

  getLongestLine(): number {
    throw new Error('Not implemented');
  }

  getMaxIntrinsicWidth(): number {
    return 0;
  }

  getMaxWidth(): number {
    throw new Error('Not implemented');
  }

  getMinIntrinsicWidth(): number {
    return 0;
  }

  getRectsForPlaceholders(): FlattenedRectangleArray {
    throw new Error('Not implemented');
  }

  getRectsForRange(
    start: number,
    end: number,
    hStyle: RectHeightStyle,
    wStyle: RectWidthStyle,
  ): FlattenedRectangleArray {
    throw new Error('Not implemented');
  }

  getWordBoundary(offset: number): URange {
    throw new Error('Not implemented');
  }

  getShapedLines(): ShapedLine[] {
    throw new Error('Not implemented');
  }

  layout(width: number): void {
    // throw new Error('Not implemented');
  }
}
