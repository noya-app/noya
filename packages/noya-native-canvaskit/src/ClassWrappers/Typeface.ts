import { Skia, Typeface as RNSkiaTypeface } from '@shopify/react-native-skia';

import type { Typeface, GlyphIDArray, TypefaceFactory } from 'canvaskit';
import { JSEmbindObject } from './Embind';

class SkiaTypeface extends JSEmbindObject implements Typeface {
  constructor(private _typeface: RNSkiaTypeface) {
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
  }
}

export const SkiaTypefaceFactory: TypefaceFactory = {
  MakeFreeTypeFaceFromData(fontData: ArrayBuffer): SkiaTypeface | null {
    // TODO: cast data
    const tf = Skia.Typeface.MakeFreeTypeFaceFromData(fontData);

    if (tf) {
      return new SkiaTypeface(tf);
    }

    return null;
  },
};
