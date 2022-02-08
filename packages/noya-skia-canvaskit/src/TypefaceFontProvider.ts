import { Skia } from '@shopify/react-native-skia';

import type {
  TypefaceFontProvider,
  TypefaceFontProviderFactory,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';

export class SkiaTypefaceFontProvider
  extends JSEmbindObject
  implements TypefaceFontProvider
{
  registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void {
    // Skia.Typeface.MakeFreeTypeFaceFromData(bytes);
  }
}

export class SkiaTypefaceFontProviderFactory
  extends JSEmbindObject
  implements TypefaceFontProviderFactory
{
  Make(): TypefaceFontProvider {
    return new SkiaTypefaceFontProvider();
  }
}
