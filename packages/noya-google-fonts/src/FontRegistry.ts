import { FontFamilyId, formatFontFamilyId } from 'noya-fonts';
import { GoogleFontFamily } from './types';

export class FontRegistry {
  constructor(webfonts: GoogleFontFamily[]) {
    webfonts.forEach((font) => {
      this.addFont(font);
    });
  }

  private fontMap = new Map<string, GoogleFontFamily>();

  fontFamilyIds: FontFamilyId[] = [];

  getFont(id: FontFamilyId) {
    return this.fontMap.get(id.toString());
  }

  findFontFamilyId(fontFamily: string): FontFamilyId | undefined {
    const formatted = formatFontFamilyId(fontFamily);
    return this.fontMap.has(formatted)
      ? (formatted as FontFamilyId)
      : undefined;
  }

  addFont(font: GoogleFontFamily) {
    const formatted = formatFontFamilyId(font.family);
    this.fontMap.set(formatted, font);
    this.fontFamilyIds.push(formatted as FontFamilyId);
  }
}
