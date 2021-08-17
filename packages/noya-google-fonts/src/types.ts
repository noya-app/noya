export type GoogleFontCategory =
  | 'sans-serif'
  | 'serif'
  | 'display'
  | 'handwriting'
  | 'monospace';

export type GoogleFontSubset =
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

export type GoogleRegularFontVariant =
  | '100'
  | '200'
  | '300'
  | 'regular'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export type GoogleItalicFontVariant =
  | '100italic'
  | '200italic'
  | '300italic'
  | 'italic'
  | '500italic'
  | '600italic'
  | '700italic'
  | '800italic'
  | '900italic';

export type GoogleFontVariant =
  | GoogleRegularFontVariant
  | GoogleItalicFontVariant;

export interface GoogleFontFamily {
  family: string;
  variants: GoogleFontVariant[];
  subsets: GoogleFontSubset[];
  version: string;
  lastModified: string;
  files: Record<GoogleFontVariant, string>;
  category: GoogleFontCategory;
  kind: 'webfonts#webfont';
}

export interface GoogleFontList {
  items: GoogleFontFamily[];
  kind: 'webfonts#webfontList';
}
