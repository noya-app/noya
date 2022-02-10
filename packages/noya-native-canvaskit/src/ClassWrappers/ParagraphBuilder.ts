import {
  FontBlock,
  FontMgr,
  Paint,
  Paragraph,
  ParagraphBuilder,
  ParagraphStyle,
  PlaceholderAlignment,
  ShapedLine,
  TextBaseline,
  TextStyle,
  TypefaceFontProvider,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';
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

  build(): Paragraph {
    return new SkiaParagraph();
  }

  pop(): void {
    this._parts.pop();
  }

  pushStyle(text: TextStyle): void {
    this._styleStack.push(text);
  }

  pushPaintStyle(textStyle: TextStyle, fg: Paint, bg: Paint): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  static Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder {
    const builder = new SkiaParagraphBuilder();

    builder.pushStyle(style);
    return builder;
  }

  static MakeFromFontProvider(
    style: ParagraphStyle,
    fontSrc: TypefaceFontProvider,
  ): ParagraphBuilder {
    const builder = new SkiaParagraphBuilder();
    builder.pushStyle(style);
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
