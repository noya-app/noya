import { TypefaceFontProvider } from 'canvaskit';
import { FontManager } from 'noya-fonts';

export type IFontManager = Pick<
  FontManager,
  | 'getFontId'
  | 'getFontFamilyId'
  | 'getFontFamilyName'
  | 'getFontDescriptorsForFamily'
  | 'getFontFamilyIdList'
  | 'getBestFontDescriptor'
> & {
  getTypefaceFontProvider: () => TypefaceFontProvider;
};
