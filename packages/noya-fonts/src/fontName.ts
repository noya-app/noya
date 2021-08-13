/**
 * Split a font name into a font family and variant
 */
export function decodeFontName(
  fontName: string,
): { fontFamily: string; fontVariant?: string } {
  const [fontFamily, fontVariant] = fontName.split('-');

  return { fontFamily, fontVariant: fontVariant || undefined };
}

/**
 * Combine a font family and variant into a font name
 */
export function encodeFontName(fontFamily: string, fontVariant?: string) {
  return fontVariant ? `${fontFamily}-${fontVariant}` : fontFamily;
}
