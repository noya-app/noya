import { Skia, Typeface as RNSkiaTypeface } from '@shopify/react-native-skia';

import type { Typeface, GlyphIDArray } from 'canvaskit';
import { JSEmbindObject } from './Embind';

export class SkiaTypeface extends JSEmbindObject implements Typeface {
  constructor(private _typeface: RNSkiaTypeface | undefined) {
    super();
  }

  getGlyphIDs(
    str: string,
    numCodePoints?: number,
    output?: GlyphIDArray,
  ): GlyphIDArray {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );

    return new Uint16Array();
  }

  getTypeface() {
    return this._typeface;
  }
}

export const SkiaTypefaceFactory = {
  MakeFreeTypeFaceFromData(fontData: ArrayBuffer): SkiaTypeface | null {
    const data = Skia.Data.fromBytes(new Uint8Array(fontData));

    const tf = Skia.Typeface.MakeFreeTypeFaceFromData(data);

    return new SkiaTypeface(tf);
  },
};
