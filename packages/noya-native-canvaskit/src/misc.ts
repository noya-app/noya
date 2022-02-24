import {
  Skia,
  Typeface as RNSTypeface,
  Font as RNSFont,
} from '@shopify/react-native-skia';

import {
  IFontStyle,
  ITextStyle,
  ITextShadow,
  IParagraphStyle,
  ITextFontFeatures,
  ITypefaceFactory,
  IFont,
  ITypeface,
  ITypefaceFontProvider,
  ITypefaceFontProviderFactory,
} from 'canvaskit-types';
import { Colors } from './constants';
import {
  Color,
  TextAlign,
  StrutStyle,
  TextBaseline,
  TextDirection,
  DecorationStyle,
  TextHeightBehavior,
} from './types';

export class TextStyleNative implements ITextStyle<Color> {
  backgroundColor?: Color;
  color?: Color = Colors.WHITE;
  decoration?: number;
  decorationColor?: Color;
  decorationThickness?: number;
  decrationStyle?: DecorationStyle;
  fontFamilies?: string[] = ['system'];
  fontFeatures?: ITextFontFeatures[];
  fontSize?: number = 14;
  fontStyle?: IFontStyle;
  foregroundColor?: Color;
  heightMultiplier?: number;
  halfLeading?: boolean;
  letterSpacing?: number;
  locale?: string;
  shadows?: ITextShadow<Color>[];
  textBaseline?: TextBaseline;
  wordSpacing?: number;

  constructor(ts: ITextStyle<Color>) {
    for (const [key, value] of Object.entries(ts)) {
      this[key as keyof TextStyleNative] = value;
    }
  }
}

export class ParagraphStyleNative implements IParagraphStyle<Color> {
  disableHinting?: boolean;
  ellipsis?: string;
  heightMultiplier?: number;
  maxLines?: number;
  strutStyle?: StrutStyle;
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  textHeightBehavior?: TextHeightBehavior;
  textStyle?: TextStyleNative;

  constructor(ps: IParagraphStyle<Color>) {
    for (const [key, value] of Object.entries(ps)) {
      this[key as keyof ParagraphStyleNative] = value;
    }
  }
}

export class FontNative implements IFont {
  private _font: RNSFont;
  private _typeface: RNSTypeface;

  constructor(face: ITypeface, size?: number) {
    this._font = Skia.Font(face as RNSTypeface, size);
    this._typeface = face as RNSTypeface;
  }

  getFont() {
    return this._font;
  }

  getTypeface(): RNSTypeface {
    return this._typeface;
  }
}

export const TypefaceFactoryNative: ITypefaceFactory = {
  MakeFreeTypeFaceFromData(fontData: ArrayBuffer): RNSTypeface | null {
    const data = Skia.Data.fromBytes(new Uint8Array(fontData));

    return Skia.Typeface.MakeFreeTypeFaceFromData(data);
  },
};

export class TypefaceFontProviderNative implements ITypefaceFontProvider {
  public typefaces: { [name: string]: ITypeface | null } = {};

  registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void {
    this.typefaces[family] =
      TypefaceFactoryNative.MakeFreeTypeFaceFromData(bytes);
  }
}

export const TypefaceFontProviderFactoryNative: ITypefaceFontProviderFactory = {
  Make(): TypefaceFontProviderNative {
    return new TypefaceFontProviderNative();
  },
};
