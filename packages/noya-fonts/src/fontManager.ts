import { Emitter } from './Emitter';
import { decodeFontName } from './fontTraits';
import { descriptorToFontId, FontDescriptor } from './fontDescriptor';
import { FontFamilyId, FontId } from './common';

export interface FontProvider {
  getFontFamilyIdList(): FontFamilyId[];
  getFontFamilyId(fontFamily: string): FontFamilyId | undefined;
  getFontFamilyName(fontFamilyId: FontFamilyId): string | undefined;
  getFontFileUrl(descriptor: FontDescriptor): string | undefined;
  getFontDescriptorsForFamily(fontFamily: FontFamilyId): FontDescriptor[];
}

export const SYSTEM_FONT_ID = 'system' as FontId;

export class FontManager {
  constructor(public provider: FontProvider) {
    this.provider = provider;
  }

  private emitter = new Emitter<[FontId, ArrayBuffer]>();

  addDownloadedFontListener = this.emitter.addListener;
  removeDownloadedFontListener = this.emitter.removeListener;

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
    const { fontFamily, fontTraits } = decodeFontName(fontName);
    const fontFamilyId = this.getFontFamilyId(fontFamily);

    if (!fontFamilyId) return;

    const descriptors = this.getFontDescriptorsForFamily(fontFamilyId);

    return filterBestMatch(descriptors, [
      (d) => d.fontSlant === fontTraits.fontSlant,
      (d) => d.fontWeight === fontTraits.fontWeight,
      (d) => d.fontWeight === 'regular',
    ]);
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
      // For now, we don't retry downloading fonts (i.e. the font stays pending on failure).
      // A naive approach could make a lot of unnecessary network requests and hit the server
      // pretty hard.
      console.warn('Failed to load font', fontId);
      return;
    }

    console.info('fetched font', {
      fontDescriptor,
      url,
      data: data.byteLength,
    });

    this.pendingFonts.delete(fontId.toString());
    this.loadedFonts.set(fontId.toString(), data);

    this.emitter.emit(fontId, data);
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

function filterBestMatch<T>(items: T[], filters: ((item: T) => boolean)[]) {
  return filters.reduce((result, filter) => {
    const filtered = result.filter(filter);
    return filtered.length > 0 ? filtered : items;
  }, items)[0];
}
