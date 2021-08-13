import { FontFamilyID, FontVariant, getFontFile } from 'noya-google-fonts';
import { Emitter } from './Emitter';

export class FontID extends String {
  // Enforce typechecking. Without this, TypeScript will allow string literals
  __tag: any;

  static make(fontFamilyID: FontFamilyID, fontVariant: FontVariant) {
    return new FontID(`${fontFamilyID}-${fontVariant}`);
  }
}

export class FontManager extends Emitter {
  get entries() {
    return [...this.loadedFonts.entries()];
  }

  get values() {
    return [...this.loadedFonts.values()];
  }

  private loadedFonts: Map<string, ArrayBuffer> = new Map();

  private pendingFonts: Set<string> = new Set();

  async addFont(fontFamily: FontFamilyID, fontVariant: FontVariant) {
    const url = getFontFile(fontFamily, fontVariant);
    const fontId = FontID.make(fontFamily, fontVariant);

    if (
      this.pendingFonts.has(fontId.toString()) ||
      this.loadedFonts.has(fontId.toString())
    )
      return;

    this.pendingFonts.add(fontId.toString());

    let data: ArrayBuffer;

    try {
      data = await fetch(url).then((resp) => resp.arrayBuffer());
    } catch (error) {
      console.warn('Failed to load font', fontId);
      return;
    } finally {
      this.pendingFonts.delete(fontId.toString());
    }

    console.info('fetched font', {
      fontFamily,
      fontVariant,
      url,
      data: data.byteLength,
    });

    this.loadedFonts.set(fontId.toString(), data);

    this.emit();
  }

  static shared = new FontManager();
}

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
export function encodeFontName(fontFamily: string, variant?: string) {
  return variant ? `${fontFamily}-${variant}` : fontFamily;
}
