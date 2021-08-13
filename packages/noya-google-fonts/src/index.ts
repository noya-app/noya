import {
  FontFamilyID,
  FontProvider,
  FontWeight,
  formatFontFamilyID,
} from 'noya-fonts';
import {
  FontVariant,
  ItalicFontVariant,
  RegularFontVariant,
  WebfontFamily,
  WebfontList,
} from './types';

export * from './types';

export class FontRegistry {
  constructor(webfonts: WebfontFamily[]) {
    webfonts.forEach((font) => {
      this.addFont(font);
    });
  }

  private fontMap = new Map<string, WebfontFamily>();

  fontFamilyIds: FontFamilyID[] = [];

  getFont(id: FontFamilyID) {
    return this.fontMap.get(id.toString());
  }

  findFontFamilyID(fontFamily: string): FontFamilyID | undefined {
    const formatted = formatFontFamilyID(fontFamily);
    return this.fontMap.has(formatted)
      ? (formatted as FontFamilyID)
      : undefined;
  }

  hasFont(id: FontFamilyID) {
    return this.fontMap.has(id.toString());
  }

  addFont(font: WebfontFamily) {
    const formatted = formatFontFamilyID(font.family);
    this.fontMap.set(formatted, font);
    this.fontFamilyIds.push(formatted as FontFamilyID);
  }
}

const webfontList: WebfontList = require('./fonts.json');
const fonts = webfontList.items;
const fontRegistry = new FontRegistry(fonts);

export function getFontFamilyList() {
  return fonts.map((font) => font.family);
}

export function getFontFamilyIdList(): FontFamilyID[] {
  return fontRegistry.fontFamilyIds;
}

export function hasFontFamilyId(fontFamilyId: FontFamilyID) {
  return fontRegistry.hasFont(fontFamilyId);
}

export type FontVariantCollection = {
  regular: RegularFontVariant[];
  italic: ItalicFontVariant[];
};

function isItalicVariant(variant: FontVariant): variant is ItalicFontVariant {
  return variant.includes('italic');
}

function isRegularVariant(variant: FontVariant): variant is RegularFontVariant {
  return !variant.includes('italic');
}

export function getFontDefinition(fontFamilyID: FontFamilyID) {
  return fontRegistry.getFont(fontFamilyID)!;
}

export function getFontVariants(fontFamilyID: FontFamilyID) {
  return getFontDefinition(fontFamilyID).variants;
}

export function getFontVariantCollection(
  fontFamilyID: FontFamilyID,
): FontVariantCollection {
  const variants = getFontDefinition(fontFamilyID).variants;
  const regular = variants.filter(isRegularVariant);
  const italic = variants.filter(isItalicVariant);

  return { regular, italic };
}

export function getFontFile(fontFamilyID: FontFamilyID, variant: FontVariant) {
  return getFontDefinition(fontFamilyID).files[variant];
}

export function getFontFamilyId(fontFamily: string): FontFamilyID | undefined {
  return fontRegistry.findFontFamilyID(fontFamily);
}

export function getFontVariantWeight(variant: FontVariant) {
  switch (variant) {
    case '100':
    case '100italic':
      return 'ultralight';
    case '200':
    case '200italic':
      return 'thin';
    case '300':
    case '300italic':
      return 'light';
    case 'regular':
    case 'italic':
      return 'regular';
    case '500':
    case '500italic':
      return 'medium';
    case '600':
    case '600italic':
      return 'semibold';
    case '700':
    case '700italic':
      return 'bold';
    case '800':
    case '800italic':
      return 'heavy';
    case '900':
    case '900italic':
      return 'black';
  }
}

export function isValidFontVariant(string: string): string is FontVariant {
  switch (string) {
    case '100':
    case '100italic':
    case '200':
    case '200italic':
    case '300':
    case '300italic':
    case 'regular':
    case 'italic':
    case '500':
    case '500italic':
    case '600':
    case '600italic':
    case '700':
    case '700italic':
    case '800':
    case '800italic':
    case '900':
    case '900italic':
      return true;
    default:
      return false;
  }
}

export function decodeFontVariant(
  variant: FontVariant,
): {
  weight: FontWeight;
  variantName: 'regular' | 'italic';
} {
  return {
    weight: getFontVariantWeight(variant),
    variantName: isItalicVariant(variant) ? 'italic' : 'regular',
  };
}

export function encodeFontVariant(
  fontVariantName: 'regular' | 'italic',
  fontWeight: FontWeight,
): FontVariant {
  const suffix = fontVariantName === 'regular' ? '' : 'italic';

  switch (fontWeight) {
    case 'ultralight':
      return `100${suffix}`;
    case 'thin':
      return `200${suffix}`;
    case 'light':
      return `300${suffix}`;
    case 'regular':
      return fontVariantName;
    case 'medium':
      return `500${suffix}`;
    case 'semibold':
      return `600${suffix}`;
    case 'bold':
      return `700${suffix}`;
    case 'heavy':
      return `800${suffix}`;
    case 'black':
      return `900${suffix}`;
  }
}

export const GoogleFontProvider: FontProvider = {
  getFontFileUrl(fontFamilyId, fontVariantName, fontWeight) {
    const fontVariant = encodeFontVariant(fontVariantName, fontWeight);
    return getFontFile(fontFamilyId, fontVariant);
  },
};
