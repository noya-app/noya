export type FontCategory =
  | 'sans-serif'
  | 'serif'
  | 'display'
  | 'handwriting'
  | 'monospace';

export type FontSubset =
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

export interface WebfontFamily {
  family: string;
  variants: FontVariant[];
  subsets: FontSubset[];
  version: string;
  lastModified: string;
  files: Record<FontVariant, string>;
  category: FontCategory;
  kind: 'webfonts#webfont';
}

export interface WebfontList {
  items: WebfontFamily[];
  kind: 'webfonts#webfontList';
}
