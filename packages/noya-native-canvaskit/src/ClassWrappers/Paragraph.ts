import { ICanvas } from '@shopify/react-native-skia';

import {
  FlattenedRectangleArray,
  LineMetrics,
  Paragraph,
  PositionWithAffinity,
  RectHeightStyle,
  RectWidthStyle,
  ShapedLine,
  TextStyle,
  URange,
} from 'canvaskit';
import { SkiaTypefaceFontProvider } from './TypefaceFontProvider';
import { SkiaParagraphStyle } from './ParagraphStyle';
import { JSEmbindObject } from './Embind';
import { SkiaPaint } from './Paint';
import { SkiaFont } from './Font';

interface ParagraphBlock {
  text: string;
  style: TextStyle;
}

interface TextBlock {
  text: string;
  paint: SkiaPaint;
  font: SkiaFont;
}

export class SkiaParagraph extends JSEmbindObject implements Paragraph {
  _blocks: TextBlock[] = [];
  _height: number = 0;
  _maxWidth: number = 0;

  constructor(
    blocks: ParagraphBlock[],
    paragraphStyle: SkiaParagraphStyle,
    fontProvider: SkiaTypefaceFontProvider,
  ) {
    super();

    blocks.forEach(({ text, style }) => {
      const fontFamily = style.fontFamilies![0];
      const typeface =
        fontProvider.typefaces[fontFamily] ||
        fontProvider.typefaces[Object.keys(fontProvider.typefaces)[0]]!;
      const font = new SkiaFont(typeface, style.fontSize);
      const paint = new SkiaPaint();
      paint.setColor(
        paragraphStyle.textStyle?.color ?? style.color ?? [1, 0, 1, 1],
      );
      const textSize = font.getFont().measureText(text, paint.getRNSkiaPaint());

      this._height = Math.max(textSize.height, this._height);
      this._maxWidth = Math.max(textSize.width, this._maxWidth);

      this._blocks.push({ text, paint, font });
    });
  }

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
    // console.warn(
    //   `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    // );
    return this._height;
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
    // console.warn(
    //   `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    // );
    return this._maxWidth;
  }

  getMaxWidth(): number {
    return this._maxWidth;
  }

  getMinIntrinsicWidth(): number {
    return this._maxWidth;
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

  draw(canvas: ICanvas, x: number, y: number) {
    this._blocks.forEach(({ text, font, paint }) => {
      canvas.drawText(text, x, y, paint.getRNSkiaPaint(), font.getFont());
    });
  }

  layout(width: number): void {
    // console.warn(
    //   `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    // );
  }
}
