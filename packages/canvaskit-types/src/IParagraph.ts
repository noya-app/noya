import type { IRectWidthStyle, IRectHeightStyle } from './Enums';
import type {
  IURange,
  ITextStyle,
  IShapedLine,
  ILineMetrics,
  EmbindObject,
  IParagraphStyle,
  IPositionWithAfinity,
  ITypefaceFontProvider,
} from './misc';

export interface IParagraph extends EmbindObject {
  getGlyphPositionAtCoordinate(dx: number, dy: number): IPositionWithAfinity;
  getHeight(): number;
  getLineMetrics(): ILineMetrics[];
  getMaxIntrinsicWidth(): number;
  getMaxWidth(): number;
  getMinIntrinsicWidth(): number;
  getRectsForRange(
    start: number,
    end: number,
    hStyle: IRectHeightStyle,
    wStyle: IRectWidthStyle,
  ): number[][]; // TODO: verify, original canvaskit type
  // refers to this as flattened array, while the noya-renderer uses
  // it as array of Float32Array or two-dim array
  getWordBoundary(offset: number): IURange;
  getShapedLines(): IShapedLine[];
  layout(width: number): void;
}

export interface IParagraphBuilder<IColor> extends EmbindObject {
  addText(str: string): void;
  build(): IParagraph;
  pop(): void;
  pushStyle(textStyle: ITextStyle<IColor>): void;
  setParagraphStyle(style: IParagraphStyle<IColor>): void;
}

export interface IParagraphBuilderFactory<IColor> {
  MakeFromFontProvider(
    style: IParagraphStyle<IColor>,
    fontSrc: ITypefaceFontProvider,
  ): IParagraphBuilder<IColor>;
}
