import type { TypefaceFontProvider } from 'canvaskit';
import { JSEmbindObject } from './Embind';
import { SkiaTypeface, SkiaTypefaceFactory } from './Typeface';

export class SkiaTypefaceFontProvider
  extends JSEmbindObject
  implements TypefaceFontProvider
{
  public typefaces: { [name: string]: SkiaTypeface | null } = {};

  registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void {
    this.typefaces[family] =
      SkiaTypefaceFactory.MakeFreeTypeFaceFromData(bytes);
  }
}

export const SkiaTypefaceFontProviderFactory = {
  Make(): SkiaTypefaceFontProvider {
    return new SkiaTypefaceFontProvider();
  },
};
