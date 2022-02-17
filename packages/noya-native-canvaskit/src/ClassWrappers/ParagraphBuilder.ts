import { FontBlock, FontMgr, ShapedLine } from 'canvaskit';

import { PlaceholderAlignment, TextBaseline } from '../types';
import { SkiaTypefaceFontProvider } from './TypefaceFontProvider';
import { SkiaParagraphStyle } from './ParagraphStyle';
import { SkiaParagraph } from './Paragraph';
import { SkiaTextStyle } from './TextStyle';
import { JSEmbindObject } from './Embind';
import { SkiaPaint } from './Paint';

export class SkiaParagraphBuilder extends JSEmbindObject {
  _parts: {
    text: string;
    style?: SkiaTextStyle;
  }[] = [];
  _styleStack: SkiaTextStyle[] = [];
  _paragraphStyle: SkiaParagraphStyle | undefined;

  constructor(private _fontProvider: SkiaTypefaceFontProvider | undefined) {
    super();
  }

  addPlaceholder(
    width?: number,
    height?: number,
    alignment?: PlaceholderAlignment,
    baseline?: TextBaseline,
    offset?: number,
  ): void {
    console.warn(`SkiaParagraphBuilder.addPlaceholder not implemented!`);
  }

  addText(str: string): void {
    this._parts.push({
      text: str,
      style: new SkiaTextStyle(this._styleStack[0]),
    });
  }

  build(): SkiaParagraph {
    return new SkiaParagraph(
      // @ts-ignore TODO: common type for parts/blocks?
      this._parts,
      this._paragraphStyle,
      this._fontProvider,
    );
  }

  pop(): void {
    this._styleStack.shift();
  }

  pushStyle(text: SkiaTextStyle): void {
    this._styleStack.unshift(text);
  }

  pushPaintStyle(textStyle: SkiaTextStyle, fg: SkiaPaint, bg: SkiaPaint): void {
    console.warn(`SkiaParagraphBuilder.pushPaintStyle not implemented!`);
  }

  setProvider(provider: SkiaTypefaceFontProvider) {
    this._fontProvider = provider;
  }

  setParagraphStyle(style: SkiaParagraphStyle) {
    this._paragraphStyle = style;
  }

  static Make(
    style: SkiaParagraphStyle,
    fontManager: FontMgr,
  ): SkiaParagraphBuilder {
    const builder = new SkiaParagraphBuilder(undefined);

    builder.pushStyle(style.textStyle!);
    return builder;
  }

  static MakeFromFontProvider(
    style: SkiaParagraphStyle,
    fontSrc: SkiaTypefaceFontProvider,
  ): SkiaParagraphBuilder {
    const builder = new SkiaParagraphBuilder(fontSrc);

    builder.pushStyle(style.textStyle!);
    builder.setParagraphStyle(style);

    return builder;
  }

  static ShapeText(
    text: string,
    runs: FontBlock[],
    width?: number,
    // @ts-ignore
  ): ShapedLine[] {
    console.warn(`SkiaParagraphBuilder.ShapeText not implemented!`);
  }
}
