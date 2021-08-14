import { Brand } from 'noya-utils';

export * from './fontTraits';
export * from './fontDescriptor';
export * from './fontManager';
export * from './fontWeight';

export function formatFontFamilyId(fontFamily: string) {
  return fontFamily.toLowerCase().replace(/[ _-]/g, '');
}

export type FontFamilyId = Brand<string, 'fontFamily'>;
