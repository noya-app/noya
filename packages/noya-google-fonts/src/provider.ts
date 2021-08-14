import { FontDescriptor, FontFamilyId, FontProvider } from 'noya-fonts';
import { FontRegistry } from './FontRegistry';
import { GoogleFontList } from './types';
import { decodeGoogleFontVariant, encodeGoogleFontVariant } from './variant';

const webfontList: GoogleFontList = require('./fonts.json');

const fontRegistry = new FontRegistry(webfontList.items);

function getFontDefinition(fontFamilyID: FontFamilyId) {
  return fontRegistry.getFont(fontFamilyID);
}

export const GoogleFontProvider: FontProvider = {
  getFontFamilyIdList() {
    return fontRegistry.fontFamilyIds;
  },

  getFontFamilyId(fontFamily: string) {
    return fontRegistry.findFontFamilyId(fontFamily);
  },

  getFontFamilyName(fontFamilyId: FontFamilyId) {
    return fontRegistry.getFont(fontFamilyId)?.family;
  },

  getFontFileUrl(descriptor: FontDescriptor) {
    const fontVariant = encodeGoogleFontVariant(
      descriptor.fontSlant,
      descriptor.fontWeight,
    );

    return getFontDefinition(descriptor.fontFamilyId)?.files[fontVariant];
  },

  getFontDescriptorsForFamily(fontFamilyId: FontFamilyId) {
    const definition = getFontDefinition(fontFamilyId);

    if (!definition) return [];

    return definition.variants.map((variant) => ({
      fontFamilyId: fontFamilyId,
      ...decodeGoogleFontVariant(variant),
    }));
  },
};
