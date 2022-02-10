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

export class SkiaParagraph extends JSEmbindObject implements Paragraph {
  didExceedMaxLines(): boolean {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getAlphabeticBaseline(): number {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getHeight(): number {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
    // throw new Error(`${this.constructor.name}.${arguments.callee.name} not implemented!`);
  }

  getIdeographicBaseline(): number {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getLineMetrics(): LineMetrics[] {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getLongestLine(): number {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getMaxIntrinsicWidth(): number {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getMaxWidth(): number {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getMinIntrinsicWidth(): number {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getRectsForPlaceholders(): FlattenedRectangleArray {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getRectsForRange(
    start: number,
    end: number,
    hStyle: RectHeightStyle,
    wStyle: RectWidthStyle,
  ): FlattenedRectangleArray {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getWordBoundary(offset: number): URange {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getShapedLines(): ShapedLine[] {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  layout(width: number): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
    // throw new Error(`${this.constructor.name}.${arguments.callee.name} not implemented!`);
  }
}
