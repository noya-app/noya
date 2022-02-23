import { Skia, Typeface as RNSkiaTypeface } from '@shopify/react-native-skia';

import type { GlyphIDArray } from 'canvaskit';
import { JSEmbindObject } from './Embind';

export class SkiaTypeface extends JSEmbindObject {
  constructor(private _typeface: RNSkiaTypeface | null) {
    super();
  }

  getGlyphIDs(
    str: string,
    numCodePoints?: number,
    output?: GlyphIDArray,
  ): GlyphIDArray {
    console.warn(`SkiaTypeface.getGlyphIDs not implemented!`);

    return new Uint16Array();
  }

  getTypeface() {
    return this._typeface ?? undefined;
  }
}

export const SkiaTypefaceFactory = {
  MakeFreeTypeFaceFromData(fontData: ArrayBuffer): SkiaTypeface | null {
    const data = Skia.Data.fromBytes(new Uint8Array(fontData));

    const tf = Skia.Typeface.MakeFreeTypeFaceFromData(data);

    return new SkiaTypeface(tf);
  },
};
