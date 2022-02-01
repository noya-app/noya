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
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getAlphabeticBaseline(): number {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getHeight(): number {
    return 0;
    // throw new Error(`${this.constructor.name}.${arguments.callee.name} not implemented!`);
  }

  getIdeographicBaseline(): number {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getLineMetrics(): LineMetrics[] {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getLongestLine(): number {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getMaxIntrinsicWidth(): number {
    return 0;
  }

  getMaxWidth(): number {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getMinIntrinsicWidth(): number {
    return 0;
  }

  getRectsForPlaceholders(): FlattenedRectangleArray {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getRectsForRange(
    start: number,
    end: number,
    hStyle: RectHeightStyle,
    wStyle: RectWidthStyle,
  ): FlattenedRectangleArray {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getWordBoundary(offset: number): URange {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getShapedLines(): ShapedLine[] {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  layout(width: number): void {
    // throw new Error(`${this.constructor.name}.${arguments.callee.name} not implemented!`);
  }
}
