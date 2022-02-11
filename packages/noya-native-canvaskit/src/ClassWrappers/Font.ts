import { Skia, Font as RNSkiaFont } from '@shopify/react-native-skia';

import type {
  Font,
  Paint,
  FontMetrics,
  EmbindEnumEntity,
  InputGlyphIDArray,
} from 'canvaskit';
import { SkiaTypeface } from './Typeface';

import { JSEmbindObject } from './Embind';

export class SkiaFont extends JSEmbindObject implements Font {
  private _font: RNSkiaFont;

  constructor(face: SkiaTypeface, size?: number) {
    super();

    this._font = Skia.Font(face.getTypeface(), size);
  }

  getFont() {
    return this._font;
  }

  getMetrics(): FontMetrics {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getGlyphBounds(
    glyphs: InputGlyphIDArray,
    paint?: Paint | null,
    output?: Float32Array,
  ): Float32Array {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getGlyphIDs(
    str: string,
    numCodePoints?: number,
    output?: Uint16Array,
  ): Uint16Array {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getGlyphWidths(
    glyphs: InputGlyphIDArray,
    paint?: Paint | null,
    output?: Float32Array,
  ): Float32Array {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getGlyphIntercepts(
    glyphs: InputGlyphIDArray,
    positions: number[] | Float32Array,
    top: number,
    bottom: number,
  ): Float32Array {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getScaleX(): number {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getSize(): number {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getSkewX(): number {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  isEmbolden(): boolean {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getTypeface(): SkiaTypeface | null {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setEdging(edging: EmbindEnumEntity): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setEmbeddedBitmaps(embeddedBitmaps: boolean): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setHinting(hinting: EmbindEnumEntity): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setLinearMetrics(linearMetrics: boolean): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setScaleX(sx: number): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setSize(points: number): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setSkewX(sx: number): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setEmbolden(embolden: boolean): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setSubpixel(subpixel: boolean): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setTypeface(face: SkiaTypeface | null): void {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }
}
