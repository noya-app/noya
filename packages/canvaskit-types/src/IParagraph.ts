import type { EnumEntity } from './Enums';
import type {
  IURange,
  ITextStyle,
  IShapedLine,
  ILineMetrics,
  IParagraphStyle,
  IPositionWithAfinity,
  ITypefaceFontProvider,
} from './misc';

export interface IParagraph<IRectArray> {
  getGlyphPositionAtCoordinate(dx: number, dy: number): IPositionWithAfinity;
  getHeight(): number;
  getLineMetrics(): ILineMetrics;
  getMaxIntrinsicWidth(): number;
  getMaxWidth(): number;
  getMinIntrinsicWidth(): number;
  getRectsForRange(
    start: number,
    end: number,
    hStyle: EnumEntity,
    wStyle: EnumEntity,
    // @ts-ignore
  ): IRectArray;
  getWordBoundary(offset: number): IURange;
  getShapedLines(): IShapedLine[];
  layout(width: number): void;
}

export interface IParagraphBuilder<IColor, IRectArray> {
  addText(str: string): void;
  build(): IParagraph<IRectArray>;
  pop(): void;
  pushStyle(textStyle: ITextStyle<IColor>): void;
  setParagraphStyle(style: IParagraphStyle<IColor>): void;
}

export interface IParagraphBuilderFactory<IColor, IRectArray> {
  MakeFromFontProvider(
    style: IParagraphStyle<IColor>,
    fontSrc: ITypefaceFontProvider,
  ): IParagraphBuilder<IColor, IRectArray>;
}
