import type { SkCanvas } from '@shopify/react-native-skia';

import type {
  IURange,
  IParagraph,
  IShapedLine,
  ILineMetrics,
  IRectWidthStyle,
  IRectHeightStyle,
  IParagraphBuilder,
  IPositionWithAfinity,
  IParagraphBuilderFactory,
} from 'canvaskit-types';

import type { Color } from './types';
import PaintNative from './PaintNative';
import {
  FontNative,
  JSEmbindObject,
  TextStyleNative,
  ParagraphStyleNative,
  TypefaceFontProviderNative,
} from './misc';

interface ParagraphPart {
  text: string;
  style: TextStyleNative;
}

interface TextBlock {
  text: string;
  paint: PaintNative;
  font: FontNative;
}

export class ParagraphNative extends JSEmbindObject implements IParagraph {
  private _blocks: TextBlock[] = [];
  private _height = 0;
  private _maxWidth = 0;

  constructor(
    blocks: ParagraphPart[],
    paragraphStyle: ParagraphStyleNative,
    fontProvider: TypefaceFontProviderNative,
  ) {
    super();

    blocks.forEach(({ text, style }) => {
      const fontFamily = style.fontFamilies![0];
      const typeface =
        fontProvider.typefaces[fontFamily] ||
        fontProvider.typefaces[Object.keys(fontProvider.typefaces)[0]]!;
      const font = new FontNative(typeface, style.fontSize);
      const paint = new PaintNative();

      paint.setColor(
        style.color ?? paragraphStyle.textStyle?.color ?? 0xff000000,
      );
      const textSize = font.getFont().measureText(text, paint.getRNSkiaPaint());

      this._height = Math.max(textSize.height, this._height);
      this._maxWidth = Math.max(textSize.width, this._maxWidth);

      this._blocks.push({ text, paint, font });
    });
  }

  // @ts-ignore
  getGlyphPositionAtCoordinate(dx: number, dy: number): IPositionWithAfinity {
    console.warn(
      `ParagraphNative.getGlyphPositionAtCoordinate not implemented!`,
    );
  }

  getHeight(): number {
    return this._height;
  }

  // @ts-ignore
  getLineMetrics(): ILineMetrics[] {
    console.warn(`ParagraphNative.getLineMetrics not implemented!`);
  }
  getMaxIntrinsicWidth(): number {
    return this._maxWidth;
  }
  getMaxWidth(): number {
    return this._maxWidth;
  }
  getMinIntrinsicWidth(): number {
    return this._maxWidth;
  }

  getRectsForRange(
    start: number,
    end: number,
    hStyle: IRectHeightStyle,
    wStyle: IRectWidthStyle,
    // @ts-ignore
  ): RectArray {
    console.warn(`ParagraphNative.getRectsForRange not implemented!`);
  }

  // @ts-ignore
  getWordBoundary(offset: number): IURange {
    console.warn(`ParagraphNative.getWordBoundary not implemented!`);
  }

  // @ts-ignore
  getShapedLines(): IShapedLine[] {
    console.warn(`ParagraphNative.getShapedLines not implemented!`);
  }

  draw(canvas: SkCanvas, x: number, y: number) {
    this._blocks.forEach(({ text, font, paint }) => {
      canvas.drawText(text, x, y, paint.getRNSkiaPaint(), font.getFont());
    });
  }

  layout(width: number): void {}
}

export class ParagraphBuilderNative
  extends JSEmbindObject
  implements IParagraphBuilder<Color>
{
  private _parts: ParagraphPart[] = [];
  private _styleStack: TextStyleNative[] = [];
  private _paragraphStyle: ParagraphStyleNative | undefined;

  constructor(private _fontProvider: TypefaceFontProviderNative) {
    super();
  }

  addText(str: string): void {
    this._parts.push({
      text: str,
      style: new TextStyleNative(this._styleStack[0]),
    });
  }

  build(): ParagraphNative {
    return new ParagraphNative(
      this._parts,
      this._paragraphStyle!,
      this._fontProvider,
    );
  }

  pop(): void {
    this._styleStack.shift();
  }

  pushStyle(textStyle: TextStyleNative): void {
    this._styleStack.unshift(textStyle);
  }

  setParagraphStyle(style: ParagraphStyleNative): void {
    this._paragraphStyle = style;
  }
}

export const ParagraphBuilderFactoryNative: IParagraphBuilderFactory<Color> = {
  MakeFromFontProvider(
    style: ParagraphStyleNative,
    fontSrc: TypefaceFontProviderNative,
  ): ParagraphBuilderNative {
    const builder = new ParagraphBuilderNative(fontSrc);

    builder.pushStyle(style.textStyle!);
    builder.setParagraphStyle(style);

    return builder;
  },
};
