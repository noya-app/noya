import type {
  Font,
  Paint,
  Typeface,
  FontMetrics,
  EmbindEnumEntity,
  InputGlyphIDArray,
} from 'canvaskit';

import { JSEmbindObject } from './Embind';

export class SkiaFont extends JSEmbindObject implements Font {
  getMetrics(): FontMetrics {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getGlyphBounds(
    glyphs: InputGlyphIDArray,
    paint?: Paint | null,
    output?: Float32Array,
  ): Float32Array {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getGlyphIDs(
    str: string,
    numCodePoints?: number,
    output?: Uint16Array,
  ): Uint16Array {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getGlyphWidths(
    glyphs: InputGlyphIDArray,
    paint?: Paint | null,
    output?: Float32Array,
  ): Float32Array {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getGlyphIntercepts(
    glyphs: InputGlyphIDArray,
    positions: number[] | Float32Array,
    top: number,
    bottom: number,
  ): Float32Array {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getScaleX(): number {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getSize(): number {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getSkewX(): number {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  isEmbolden(): boolean {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  getTypeface(): Typeface | null {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setEdging(edging: EmbindEnumEntity): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setEmbeddedBitmaps(embeddedBitmaps: boolean): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setHinting(hinting: EmbindEnumEntity): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setLinearMetrics(linearMetrics: boolean): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setScaleX(sx: number): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setSize(points: number): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setSkewX(sx: number): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setEmbolden(embolden: boolean): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setSubpixel(subpixel: boolean): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }

  setTypeface(face: Typeface | null): void {
    throw new Error(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  }
}
