import { Brand } from 'noya-utils';

export * from './fontName';
export * from './fontManager';

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

export function formatFontFamilyID(fontFamily: string) {
  return fontFamily.toLowerCase().replace(/[ _-]/g, '');
}

export type FontFamilyID = Brand<string, 'fontFamily'>;
