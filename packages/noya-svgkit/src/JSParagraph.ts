import { range, windowsOf } from '@noya-app/noya-utils';
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
import { JSEmbindObject } from './Embind';

export class JSParagraph extends JSEmbindObject implements Paragraph {
  _parts: {
    text: string;
    style?: TextStyle;
  }[] = [];

  _metrics?: TextMetrics;
  _measuredCharacters: number[] = [];

  didExceedMaxLines(): boolean {
    throw new Error('Not implemented');
  }

  getAlphabeticBaseline(): number {
    throw new Error('Not implemented');
  }

  getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
    throw new Error('Not implemented');
  }

  getHeight(): number {
    if (!this._metrics) {
      throw new Error('JSParagraph not measured');
    }

    return (
      this._metrics.fontBoundingBoxAscent + this._metrics.fontBoundingBoxDescent
    );
  }

  getIdeographicBaseline(): number {
    throw new Error('Not implemented');
  }

  getLineMetrics(): LineMetrics[] {
    throw new Error('Not implemented');
  }

  getLongestLine(): number {
    throw new Error('Not implemented');
  }

  getMaxIntrinsicWidth(): number {
    if (!this._metrics) {
      throw new Error('JSParagraph not measured');
    }

    return this._metrics.width;
  }

  getMaxWidth(): number {
    if (!this._metrics) {
      throw new Error('JSParagraph not measured');
    }

    return this._metrics.width;
  }

  getMinIntrinsicWidth(): number {
    if (!this._metrics) {
      throw new Error('JSParagraph not measured');
    }

    return this._metrics.width;
  }

  getRectsForPlaceholders(): FlattenedRectangleArray {
    throw new Error('Not implemented');
  }

  getRectsForRange(
    start: number,
    end: number,
    hStyle: RectHeightStyle,
    wStyle: RectWidthStyle,
  ): FlattenedRectangleArray {
    throw new Error('Not implemented');
  }

  getWordBoundary(offset: number): URange {
    throw new Error('Not implemented');
  }

  getShapedLines(): ShapedLine[] {
    const text = this._parts.map((part) => part.text).join('');

    const baseline = 10;
    const shapedLine: ShapedLine = {
      runs: [
        {
          fakeBold: false,
          fakeItalic: false,
          flags: 0,
          typeface: null as any,
          size: this._fontSize,
          // scaleX: 1,
          glyphs: new Uint16Array(
            text.split('').map((c) => c.charCodeAt(0) - 28),
          ),
          offsets: new Uint32Array(range(0, text.length)),
          positions: new Float32Array(this._measuredCharacters),
        },
      ],
      textRange: { first: 0, last: text.length },
      top: -0.205078125,
      bottom: 12.685546875,
      baseline: baseline,
    };

    return [shapedLine];
  }

  get _fontSize() {
    return this._parts[0].style?.fontSize ?? 11;
  }
  get _letterSpacing() {
    return this._parts[0].style?.letterSpacing ?? 0;
  }

  layout(width: number): void {
    const text = this._parts.map((part) => part.text).join('');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    context.font = context.font = `${this._fontSize} sans-serif`;

    // Experimental property
    try {
      (context as any).letterSpacing = this._letterSpacing + 'px';
    } catch {
      // ignore
    }
    this._metrics = context.measureText(text);

    function measureLine(): number[] {
      const characters = text.split('');

      const widths = characters.map((c) => context.measureText(c).width);
      const pairs = windowsOf(characters, 2).map(
        ([a, b]) => context.measureText(a + b).width,
      );

      let x = 0;
      const points: [number, number][] = [];

      for (let i = 0; i < characters.length; i++) {
        points.push([x, 10]);

        if (i < characters.length - 1) {
          x += pairs[i] - widths[i + 1];
        }
      }

      return points.flat();
    }

    this._measuredCharacters = measureLine();
  }
}
