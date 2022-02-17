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
    throw new Error(`JSParagraph.didExceedMaxLines not implemented!`);
  }

  getAlphabeticBaseline(): number {
    throw new Error(`JSParagraph.getAlphabeticBaseline not implemented!`);
  }

  getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
    throw new Error(
      `JSParagraph.getGlyphPositionAtCoordinate not implemented!`,
    );
  }

  getHeight(): number {
    return 0;
    // throw new Error(`JSParagraph.name not implemented!`);
  }

  getIdeographicBaseline(): number {
    throw new Error(`JSParagraph.getIdeographicBaseline not implemented!`);
  }

  getLineMetrics(): LineMetrics[] {
    throw new Error(`JSParagraph.getLineMetrics not implemented!`);
  }

  getLongestLine(): number {
    throw new Error(`JSParagraph.getLongestLine not implemented!`);
  }

  getMaxIntrinsicWidth(): number {
    return 0;
  }

  getMaxWidth(): number {
    throw new Error(`JSParagraph.getMaxWidth not implemented!`);
  }

  getMinIntrinsicWidth(): number {
    return 0;
  }

  getRectsForPlaceholders(): FlattenedRectangleArray {
    throw new Error(`JSParagraph.getRectsForPlaceholders not implemented!`);
  }

  getRectsForRange(
    start: number,
    end: number,
    hStyle: RectHeightStyle,
    wStyle: RectWidthStyle,
  ): FlattenedRectangleArray {
    throw new Error(`JSParagraph.getRectsForRange not implemented!`);
  }

  getWordBoundary(offset: number): URange {
    throw new Error(`JSParagraph.getWordBoundary not implemented!`);
  }

  getShapedLines(): ShapedLine[] {
    throw new Error(`JSParagraph.getShapedLines not implemented!`);
  }

  layout(width: number): void {
    // throw new Error(`JSParagraph.name not implemented!`);
  }
}
