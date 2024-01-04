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
} from '@noya-app/noya-canvaskit';
import { JSEmbindObject } from './Embind';
import { JSParagraph } from './JSParagraph';

export class JSParagraphBuilder
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
    throw new Error('Not implemented');
  }

  addText(str: string): void {
    this._parts.push({ text: str, style: this._styleStack[0] });
  }

  build(): Paragraph {
    const paragraph = new JSParagraph();
    paragraph._parts = this._parts;
    return paragraph;
  }

  pop(): void {
    this._parts.pop();
  }

  pushStyle(text: TextStyle): void {
    this._styleStack.push(text);
  }

  pushPaintStyle(textStyle: TextStyle, fg: Paint, bg: Paint): void {
    throw new Error('Not implemented');
  }

  static Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder {
    const builder = new JSParagraphBuilder();
    builder.pushStyle(style.textStyle ?? {});
    return builder;
  }

  static MakeFromFontProvider(
    style: ParagraphStyle,
    fontSrc: TypefaceFontProvider,
  ): ParagraphBuilder {
    const builder = new JSParagraphBuilder();
    builder.pushStyle(style.textStyle ?? {});
    return builder;
  }

  static ShapeText(
    text: string,
    runs: FontBlock[],
    width?: number,
  ): ShapedLine[] {
    throw new Error('Not implemented');
  }
}
