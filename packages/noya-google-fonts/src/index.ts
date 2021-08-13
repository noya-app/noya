import { FontDescriptor, FontFamilyID, FontProvider } from 'noya-fonts';
import { FontRegistry } from './FontRegistry';
import {
  GoogleFontList,
  GoogleFontVariant,
  GoogleItalicFontVariant,
  GoogleRegularFontVariant,
} from './types';
import {
  decodeGoogleFontVariant,
  encodeGoogleFontVariant,
  isItalicVariant,
  isRegularVariant,
} from './variant';

export * from './types';

const webfontList: GoogleFontList = require('./fonts.json');
const fonts = webfontList.items;
const fontRegistry = new FontRegistry(fonts);

export function getFontFamilyList() {
  return fonts.map((font) => font.family);
}

export function hasFontFamilyId(fontFamilyId: FontFamilyID) {
  return fontRegistry.hasFont(fontFamilyId);
}

export type FontVariantCollection = {
  regular: GoogleRegularFontVariant[];
  italic: GoogleItalicFontVariant[];
};

export function getFontDefinition(fontFamilyID: FontFamilyID) {
  return fontRegistry.getFont(fontFamilyID);
}

export function getFontVariants(fontFamilyID: FontFamilyID) {
  return getFontDefinition(fontFamilyID)?.variants;
}

export function getFontVariantCollection(
  fontFamilyID: FontFamilyID,
): FontVariantCollection | undefined {
  const definition = getFontDefinition(fontFamilyID);

  if (!definition) return;

  const variants = definition.variants;
  const regular = variants.filter(isRegularVariant);
  const italic = variants.filter(isItalicVariant);

  return { regular, italic };
}

export function getFontFileUrl(
  fontFamilyID: FontFamilyID,
  variant: GoogleFontVariant,
): string | undefined {
  return getFontDefinition(fontFamilyID)?.files[variant];
}

export function getFontFamilyId(fontFamily: string): FontFamilyID | undefined {
  return fontRegistry.findFontFamilyID(fontFamily);
}

export const GoogleFontProvider: FontProvider = {
  getFontFamilyIdList() {
    return fontRegistry.fontFamilyIds;
  },

  getFontFamilyId(fontFamily: string) {
    return fontRegistry.findFontFamilyID(fontFamily);
  },

  getFontFamilyName(fontFamilyId: FontFamilyID) {
    return getFontDefinition(fontFamilyId)?.family;
  },

  getFontFileUrl(descriptor: FontDescriptor) {
    const fontVariant = encodeGoogleFontVariant(
      descriptor.fontSlant,
      descriptor.fontWeight,
    );

    return getFontFileUrl(descriptor.fontFamilyId, fontVariant);
  },

  getFontDescriptorsForFamily(fontFamilyId: FontFamilyID) {
    const definition = getFontDefinition(fontFamilyId);

    if (!definition) return [];

    return definition.variants.map((variant) => ({
      fontFamilyId: fontFamilyId,
      ...decodeGoogleFontVariant(variant),
    }));
  },
};
