// import { Skia, IMaskFilter } from '@shopify/react-native-skia';

import type {
  TextBlob,
  TextBlobFactory,
  InputGlyphIDArray,
  InputFlattenedRSXFormArray,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';
import { SkiaFont } from './Font';
import { SkiaPath } from './Path';

class SkiaTextBlob extends JSEmbindObject implements TextBlob {}

export const SkiaTextBlobFactory: TextBlobFactory = {
  MakeFromGlyphs(glyphs: InputGlyphIDArray, font: SkiaFont): SkiaTextBlob {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  MakeFromRSXform(
    str: string,
    rsxforms: InputFlattenedRSXFormArray,
    font: SkiaFont,
  ): SkiaTextBlob {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  MakeFromRSXformGlyphs(
    glyphs: InputGlyphIDArray,
    rsxforms: InputFlattenedRSXFormArray,
    font: SkiaFont,
  ): SkiaTextBlob {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  MakeFromText(str: string, font: SkiaFont): SkiaTextBlob {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },

  MakeOnPath(
    str: string,
    path: SkiaPath,
    font: SkiaFont,
    initialOffset?: number,
  ): SkiaTextBlob {
    console.warn(
      `${this.constructor.name}.${arguments.callee.name} not implemented!`,
    );
  },
};
