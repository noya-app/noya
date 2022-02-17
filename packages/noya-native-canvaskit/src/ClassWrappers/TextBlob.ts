import type { InputGlyphIDArray, InputFlattenedRSXFormArray } from 'canvaskit';
import { JSEmbindObject } from './Embind';
import { SkiaFont } from './Font';
import { SkiaPath } from './Path';

class SkiaTextBlob extends JSEmbindObject {}

export const SkiaTextBlobFactory = {
  // @ts-ignore
  MakeFromGlyphs(glyphs: InputGlyphIDArray, font: SkiaFont): SkiaTextBlob {
    console.warn(`SkiaTextBlobFactory.MakeFromGlyphs not implemented!`);
  },

  MakeFromRSXform(
    str: string,
    rsxforms: InputFlattenedRSXFormArray,
    font: SkiaFont,
    // @ts-ignore
  ): SkiaTextBlob {
    console.warn(`SkiaTextBlobFactory.MakeFromRSXform not implemented!`);
  },

  MakeFromRSXformGlyphs(
    glyphs: InputGlyphIDArray,
    rsxforms: InputFlattenedRSXFormArray,
    font: SkiaFont,
    // @ts-ignore
  ): SkiaTextBlob {
    console.warn(`SkiaTextBlobFactory.MakeFromRSXformGlyphs not implemented!`);
  },

  // @ts-ignore
  MakeFromText(str: string, font: SkiaFont): SkiaTextBlob {
    console.warn(`SkiaTextBlobFactory.MakeFromText not implemented!`);
  },

  MakeOnPath(
    str: string,
    path: SkiaPath,
    font: SkiaFont,
    initialOffset?: number,
    // @ts-ignore
  ): SkiaTextBlob {
    console.warn(`SkiaTextBlobFactory.MakeOnPath not implemented!`);
  },
};
