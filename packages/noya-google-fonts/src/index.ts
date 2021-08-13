import {
  FontVariant,
  ItalicFontVariant,
  RegularFontVariant,
  WebfontFamily,
  WebfontList,
} from './types';

export * from './types';

function formatFontFamilyID(fontFamily: string) {
  return fontFamily.toLowerCase().replace(/[ _-]/g, '');
}

export class FontFamilyID extends String {
  constructor(fontFamily: string) {
    super(formatFontFamilyID(fontFamily));
  }

  // Enforce typechecking. Without this, TypeScript will allow string literals
  __tag: any;
}

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

  findFontFamilyID(fontFamily: string) {
    const formatted = formatFontFamilyID(fontFamily);
    return this.fontMap.has(formatted)
      ? new FontFamilyID(formatted)
      : undefined;
  }

  hasFont(id: FontFamilyID) {
    return this.fontMap.has(id.toString());
  }

  addFont(font: WebfontFamily) {
    const formatted = formatFontFamilyID(font.family);
    this.fontMap.set(formatted, font);
    this.fontFamilyIds.push(new FontFamilyID(formatted));
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

export type FontWeight =
  | 'ultralight'
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'heavy'
  | 'black';

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
