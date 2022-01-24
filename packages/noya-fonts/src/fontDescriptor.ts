import { FontWeight } from './fontWeight';
import { FontFamilyId, FontId } from './common';

export type FontSlant = 'upright' | 'italic';

export type FontDescriptor = {
  fontFamilyId: FontFamilyId;
  fontSlant: FontSlant;
  fontWeight: FontWeight;
};

export type FontTraits = Omit<FontDescriptor, 'fontFamilyId'>;

export function descriptorToFontId(descriptor: FontDescriptor): FontId {
  const { fontFamilyId: fontFamily, fontSlant, fontWeight } = descriptor;

  // Create object inline to guarantee specific property order
  return JSON.stringify({ fontFamily, fontSlant, fontWeight }) as FontId;
}

export function fontIdToDescriptor(fontId: FontId): FontDescriptor {
  const { fontFamily, fontSlant, fontWeight } = JSON.parse(fontId);

  return { fontFamilyId: fontFamily, fontSlant, fontWeight };
}
