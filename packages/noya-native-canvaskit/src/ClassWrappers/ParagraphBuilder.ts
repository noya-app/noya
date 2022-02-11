import {
  FontBlock,
  FontMgr,
  Paint,
  ParagraphBuilder,
  ParagraphStyle,
  PlaceholderAlignment,
  ShapedLine,
  TextBaseline,
  TextStyle,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';
import { SkiaTypefaceFontProvider } from './TypefaceFontProvider';
import { SkiaParagraph } from './Paragraph';

export class SkiaParagraphBuilder
  extends JSEmbindObject
  implements ParagraphBuilder
{
  _parts: {
    text: string;
    style?: TextStyle;
  }[] = [];
  _styleStack: TextStyle[] = [];
  _paragraphStyle: ParagraphStyle | undefined;

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
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  addText(str: string): void {
    this._parts.push({ text: str, style: this._styleStack[0] });
  }

  build(): SkiaParagraph {
    return new SkiaParagraph(
      this._parts,
      this._paragraphStyle,
      this._fontProvider,
    );
  }

  pop(): void {
    this._styleStack.pop();
  }

  pushStyle(text: TextStyle): void {
    this._styleStack.push(text);
  }

  pushPaintStyle(textStyle: TextStyle, fg: Paint, bg: Paint): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setProvider(provider: SkiaTypefaceFontProvider) {
    this._fontProvider = provider;
  }

  setParagraphStyle(style: ParagraphStyle) {
    this._paragraphStyle = style;
  }

  static Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder {
    const builder = new SkiaParagraphBuilder(undefined);

    builder.pushStyle(style.textStyle!);
    return builder;
  }

  static MakeFromFontProvider(
    style: ParagraphStyle,
    fontSrc: SkiaTypefaceFontProvider,
  ): ParagraphBuilder {
    const builder = new SkiaParagraphBuilder(fontSrc);

    builder.pushStyle(style.textStyle!);
    builder.setParagraphStyle(style);

    return builder;
  }

  static ShapeText(
    text: string,
    runs: FontBlock[],
    width?: number,
  ): ShapedLine[] {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }
}
