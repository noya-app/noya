import { Brand } from 'noya-utils';

export * from './fontTraits';
export * from './fontDescriptor';
export * from './fontManager';
export * from './fontWeight';

export function formatFontFamilyID(fontFamily: string) {
  return fontFamily.toLowerCase().replace(/[ _-]/g, '');
}

export type FontFamilyID = Brand<string, 'fontFamily'>;
