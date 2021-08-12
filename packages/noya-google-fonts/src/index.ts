const webfontList: WebfontList = require('./fonts.json');
const fonts = webfontList.items;
const fontMap = fonts.reduce((result: Record<string, WebfontFamily>, item) => {
  result[item.family.toLowerCase()] = item;
  return result;
}, {});

type FontCategory =
  | 'sans-serif'
  | 'serif'
  | 'display'
  | 'handwriting'
  | 'monospace';

type FontSubset =
  | 'latin'
  | 'latin-ext'
  | 'sinhala'
  | 'greek'
  | 'kannada'
  | 'telugu'
  | 'vietnamese'
  | 'hebrew'
  | 'cyrillic'
  | 'cyrillic-ext'
  | 'greek-ext'
  | 'arabic'
  | 'devanagari'
  | 'khmer'
  | 'tamil'
  | 'thai'
  | 'bengali'
  | 'gujarati'
  | 'oriya'
  | 'malayalam'
  | 'gurmukhi'
  | 'korean'
  | 'japanese'
  | 'tibetan'
  | 'chinese-simplified'
  | 'chinese-hongkong'
  | 'chinese-traditional'
  | 'myanmar';

export type RegularFontVariant =
  | '100'
  | '200'
  | '300'
  | 'regular'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export type ItalicFontVariant =
  | '100italic'
  | '200italic'
  | '300italic'
  | 'italic'
  | '500italic'
  | '600italic'
  | '700italic'
  | '800italic'
  | '900italic';

export type FontVariant = RegularFontVariant | ItalicFontVariant;

interface WebfontFamily {
  family: string;
  variants: FontVariant[];
  subsets: FontSubset[];
  version: string;
  lastModified: string;
  files: Record<FontVariant, string>;
  category: FontCategory;
  kind: 'webfonts#webfont';
}

interface WebfontList {
  items: WebfontFamily[];
  kind: 'webfonts#webfontList';
}

export function getFontFamilyList() {
  return fonts.map((font) => font.family);
}

export function hasFontFamily(fontFamily: string) {
  return getKey(fontFamily) in fontMap;
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

export function getFontVariants(fontFamily: string) {
  return fontMap[getKey(fontFamily)].variants;
}

export function getFontVariantCollection(
  fontFamily: string,
): FontVariantCollection {
  const variants = fontMap[getKey(fontFamily)].variants;
  const regular = variants.filter(isRegularVariant);
  const italic = variants.filter(isItalicVariant);

  return { regular, italic };
}

export function getFontFile(fontFamily: string, variant: FontVariant) {
  return fontMap[getKey(fontFamily)].files[variant];
}

function getKey(fontFamily: string) {
  return fontFamily.toLowerCase();
}

type FontWeight =
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
