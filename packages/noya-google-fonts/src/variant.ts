import { FontWeight, FontSlant } from 'noya-fonts';
import {
  GoogleFontVariant,
  GoogleItalicFontVariant,
  GoogleRegularFontVariant,
} from './types';

export function isItalicVariant(
  variant: GoogleFontVariant,
): variant is GoogleItalicFontVariant {
  return variant.includes('italic');
}

export function isRegularVariant(
  variant: GoogleFontVariant,
): variant is GoogleRegularFontVariant {
  return !variant.includes('italic');
}

export function getGoogleFontVariantWeight(variant: GoogleFontVariant) {
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

export function decodeGoogleFontVariant(
  variant: GoogleFontVariant,
): {
  fontWeight: FontWeight;
  fontSlant: FontSlant;
} {
  return {
    fontWeight: getGoogleFontVariantWeight(variant),
    fontSlant: isItalicVariant(variant) ? 'italic' : 'upright',
  };
}

export function encodeGoogleFontVariant(
  fontSlant: FontSlant,
  fontWeight: FontWeight,
): GoogleFontVariant {
  const suffix = fontSlant === 'upright' ? '' : 'italic';

  switch (fontWeight) {
    case 'ultralight':
      return `100${suffix}`;
    case 'thin':
      return `200${suffix}`;
    case 'light':
      return `300${suffix}`;
    case 'regular':
      return fontSlant === 'upright' ? 'regular' : 'italic';
    case 'medium':
      return `500${suffix}`;
    case 'semibold':
      return `600${suffix}`;
    case 'bold':
      return `700${suffix}`;
    case 'heavy':
      return `800${suffix}`;
    case 'black':
      return `900${suffix}`;
  }
}

export function isValidFontVariant(
  string: string,
): string is GoogleFontVariant {
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
