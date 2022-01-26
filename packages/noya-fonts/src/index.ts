export * from './common';
export * from './Emitter';
export * from './fontTraits';
export * from './fontDescriptor';
export * from './fontManager';
export * from './fontWeight';

export function formatFontFamilyId(fontFamily: string) {
  return fontFamily.toLowerCase().replace(/[ _-]/g, '');
}
