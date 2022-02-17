import { SkiaTypeface, SkiaTypefaceFactory } from './Typeface';
import { JSEmbindObject } from './Embind';

export class SkiaTypefaceFontProvider extends JSEmbindObject {
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
