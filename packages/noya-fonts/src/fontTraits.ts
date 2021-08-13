import { upperFirst } from 'noya-utils';
import { FontSlant, FontTraits } from './fontDescriptor';
import { ALL_FONT_WEIGHTS, isValidFontWeight } from './fontWeight';

function decodeFontTraits(fontTraits: string): FontTraits {
  const lowercase = fontTraits.toLowerCase();

  const fontSlant: FontSlant = lowercase.includes('italic')
    ? 'italic'
    : 'upright';

  const foundFontWeight = ALL_FONT_WEIGHTS.find((weight) =>
    lowercase.includes(weight),
  );

  const fontWeight =
    foundFontWeight && isValidFontWeight(foundFontWeight)
      ? foundFontWeight
      : 'regular';

  return { fontSlant, fontWeight };
}

export function encodeFontTraits(fontTraits: FontTraits): string {
  return getTraitsDisplayName(fontTraits);
}

/**
 * Split a hyphen-separated font name into a font family and traits
 */
export function decodeFontName(
  fontName: string,
): {
  fontFamily: string;
  fontTraits: FontTraits;
} {
  const [fontFamily, fontTraits] = fontName.split('-');

  return {
    fontFamily,
    fontTraits: fontTraits
      ? decodeFontTraits(fontTraits)
      : {
          fontSlant: 'upright',
          fontWeight: 'regular',
        },
  };
}

/**
 * Combine a font family and variant into a hyphen-separated font name
 */
export function encodeFontName(
  fontFamily: string,
  fontTraits: FontTraits,
): string {
  return [fontFamily, encodeFontTraits(fontTraits)].join('-');
}

/**
 * Get a user-facing description of the font traits
 */
export function getTraitsDisplayName({ fontSlant, fontWeight }: FontTraits) {
  const slantDisplayName =
    fontSlant !== 'upright' ? upperFirst(fontSlant) : undefined;

  // If we're already displaying "Italic", we don't need to display "Regular" weight
  const weightDisplayName =
    slantDisplayName && fontWeight === 'regular'
      ? undefined
      : upperFirst(fontWeight);

  return [weightDisplayName, slantDisplayName].filter((x) => !!x).join(' ');
}
