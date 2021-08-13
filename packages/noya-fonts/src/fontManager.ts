import { FontFamilyID } from 'noya-fonts';
import { Brand } from 'noya-utils';
import { Emitter } from './Emitter';
import { descriptorToFontId, FontDescriptor } from './fontDescriptor';
import { decodeFontName } from './fontTraits';

export interface FontProvider {
  getFontFamilyIdList(): FontFamilyID[];
  getFontFamilyId(fontFamily: string): FontFamilyID | undefined;
  getFontFamilyName(fontFamilyId: FontFamilyID): string | undefined;
  getFontFileUrl(descriptor: FontDescriptor): string | undefined;
  getFontDescriptorsForFamily(fontFamily: FontFamilyID): FontDescriptor[];
}

export type FontId = Brand<string, 'fontId'>;

export const SYSTEM_FONT_ID = 'system' as FontId;

export class FontManager extends Emitter {
  constructor(public provider: FontProvider) {
    super();
  }

  getFontFamilyIdList = this.provider.getFontFamilyIdList;
  getFontFamilyId = this.provider.getFontFamilyId;
  getFontFamilyName = this.provider.getFontFamilyName;
  getFontFileUrl = this.provider.getFontFileUrl;
  getFontDescriptorsForFamily = this.provider.getFontDescriptorsForFamily;

  /**
   * Get a canonical ID for a font, given a name
   *
   * @param fontName A string like "Roboto-BoldItalic"
   * @returns The canonical ID or `undefined`
   */
  getFontId = (fontName: string): FontId | undefined => {
    const { fontFamily, fontTraits } = decodeFontName(fontName);
    const fontFamilyId = this.getFontFamilyId(fontFamily);

    if (!fontFamilyId) return;

    return descriptorToFontId({ fontFamilyId, ...fontTraits });
  };

  getBestFontDescriptor = (fontName: string): FontDescriptor | undefined => {
    const { fontFamily } = decodeFontName(fontName);
    const fontFamilyId = this.getFontFamilyId(fontFamily);

    if (!fontFamilyId) return;

    const descriptors = this.getFontDescriptorsForFamily(fontFamilyId);

    return descriptors[0];
  };

  downloadFont = async (fontDescriptor: FontDescriptor) => {
    const url = this.getFontFileUrl(fontDescriptor);

    if (!url) return;

    const fontId = descriptorToFontId(fontDescriptor);

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
      fontDescriptor,
      url,
      data: data.byteLength,
    });

    this.loadedFonts.set(fontId.toString(), data);

    this.emit();
  };

  get entries() {
    return [...this.loadedFonts.entries()];
  }

  get values() {
    return [...this.loadedFonts.values()];
  }

  private loadedFonts: Map<string, ArrayBuffer> = new Map();

  private pendingFonts: Set<string> = new Set();
}
