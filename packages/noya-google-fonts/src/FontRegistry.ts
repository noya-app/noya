import { FontFamilyID, formatFontFamilyID } from 'noya-fonts';
import { GoogleFontFamily } from './types';

export class FontRegistry {
  constructor(webfonts: GoogleFontFamily[]) {
    webfonts.forEach((font) => {
      this.downloadFont(font);
    });
  }

  private fontMap = new Map<string, GoogleFontFamily>();

  fontFamilyIds: FontFamilyID[] = [];

  getFont(id: FontFamilyID) {
    return this.fontMap.get(id.toString());
  }

  findFontFamilyID(fontFamily: string): FontFamilyID | undefined {
    const formatted = formatFontFamilyID(fontFamily);
    return this.fontMap.has(formatted)
      ? (formatted as FontFamilyID)
      : undefined;
  }

  hasFont(id: FontFamilyID) {
    return this.fontMap.has(id.toString());
  }

  downloadFont(font: GoogleFontFamily) {
    const formatted = formatFontFamilyID(font.family);
    this.fontMap.set(formatted, font);
    this.fontFamilyIds.push(formatted as FontFamilyID);
  }
}
