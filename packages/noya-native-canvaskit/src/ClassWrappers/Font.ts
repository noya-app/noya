import { Skia, Font as RNSkiaFont } from '@shopify/react-native-skia';

import type { FontMetrics, InputGlyphIDArray } from 'canvaskit';
import { FontEdging, FontHinting } from '../types';
import { SkiaTypeface } from './Typeface';
import { JSEmbindObject } from './Embind';
import { SkiaPaint } from './Paint';

export class SkiaFont extends JSEmbindObject {
  private _font: RNSkiaFont;

  constructor(face: SkiaTypeface, size?: number) {
    super();

    this._font = Skia.Font(face.getTypeface(), size);
  }

  getFont() {
    return this._font;
  }

  // @ts-ignore
  getMetrics(): FontMetrics {
    console.warn(`SkiaFont.getMetrics not implemented!`);
  }

  getGlyphBounds(
    glyphs: InputGlyphIDArray,
    paint?: SkiaPaint | null,
    output?: Float32Array,
    // @ts-ignore
  ): Float32Array {
    console.warn(`SkiaFont.getGlyphBounds not implemented!`);
  }

  getGlyphIDs(
    str: string,
    numCodePoints?: number,
    output?: Uint16Array,
    // @ts-ignore
  ): Uint16Array {
    console.warn(`SkiaFont.getGlyphIDs not implemented!`);
  }

  getGlyphWidths(
    glyphs: InputGlyphIDArray,
    paint?: SkiaPaint | null,
    output?: Float32Array,
    // @ts-ignore
  ): Float32Array {
    console.warn(`SkiaFont.getGlyphWidths not implemented!`);
  }

  getGlyphIntercepts(
    glyphs: InputGlyphIDArray,
    positions: number[] | Float32Array,
    top: number,
    bottom: number,
    // @ts-ignore
  ): Float32Array {
    console.warn(`SkiaFont.getGlyphIntercepts not implemented!`);
  }

  // @ts-ignore
  getScaleX(): number {
    console.warn(`SkiaFont.getScaleX not implemented!`);
  }

  // @ts-ignore
  getSize(): number {
    console.warn(`SkiaFont.getSize not implemented!`);
  }

  // @ts-ignore
  getSkewX(): number {
    console.warn(`SkiaFont.getSkewX not implemented!`);
  }

  // @ts-ignore
  isEmbolden(): boolean {
    console.warn(`SkiaFont.isEmbolden not implemented!`);
  }

  // @ts-ignore
  getTypeface(): SkiaTypeface | null {
    console.warn(`SkiaFont.getTypeface not implemented!`);
  }

  setEdging(edging: FontEdging): void {
    console.warn(`SkiaFont.setEdging not implemented!`);
  }

  setEmbeddedBitmaps(embeddedBitmaps: boolean): void {
    console.warn(`SkiaFont.setEmbeddedBitmaps not implemented!`);
  }

  setHinting(hinting: FontHinting): void {
    console.warn(`SkiaFont.setHinting not implemented!`);
  }

  setLinearMetrics(linearMetrics: boolean): void {
    console.warn(`SkiaFont.setLinearMetrics not implemented!`);
  }

  setScaleX(sx: number): void {
    console.warn(`SkiaFont.setScaleX not implemented!`);
  }

  setSize(points: number): void {
    console.warn(`SkiaFont.setSize not implemented!`);
  }

  setSkewX(sx: number): void {
    console.warn(`SkiaFont.setSkewX not implemented!`);
  }

  setEmbolden(embolden: boolean): void {
    console.warn(`SkiaFont.setEmbolden not implemented!`);
  }

  setSubpixel(subpixel: boolean): void {
    console.warn(`SkiaFont.setSubpixel not implemented!`);
  }

  setTypeface(face: SkiaTypeface | null): void {
    console.warn(`SkiaFont.setTypeface not implemented!`);
  }
}
