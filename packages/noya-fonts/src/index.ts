export * from './Emitter';
export * from './fontDescriptor';
export * from './fontManager';
export * from './fontTraits';
export * from './fontWeight';
export * from './types';

export function formatFontFamilyId(fontFamily: string) {
  return fontFamily.toLowerCase().replace(/[ _-]/g, '');
}
