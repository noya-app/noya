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
import { SkiaTextStyle } from './TextStyle';

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

  pushStyle(text: TextStyle): void {
    this._styleStack.unshift(text);
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

const a = [
  {
    style: { color: [Float32Array], fontFamilies: [Array], fontSize: 42 },
    text: 'Title',
  },
];

const x = {
  disableHinting: undefined,
  ellipsis: undefined,
  heightMultiplier: undefined,
  maxLines: undefined,
  strutStyle: {
    fontFamilies: ['system'],
    fontSize: 42,
    forceStrutHeight: true,
    heightMultiplier: undefined,
    strutEnabled: true,
  },
  textAlign: { value: 2 },
  textDirection: undefined,
  textHeightBehavior: undefined,
  textStyle: { color: [0, 0, 0, 1], fontFamilies: ['system'], fontSize: 42 },
};
