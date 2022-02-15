import type {
  FontStyle,
  TextStyle,
  InputColor,
  TextShadow,
  TextBaseline,
  DecorationStyle,
  TextFontFeatures,
} from 'canvaskit';

import { SkiaCanvasKit } from '../SkiaCanvasKit';

export class SkiaTextStyle implements TextStyle {
  backgroundColor?: InputColor;
  color?: InputColor = SkiaCanvasKit.WHITE;
  decoration?: number;
  decorationColor?: InputColor;
  decorationThickness?: number;
  decrationStyle?: DecorationStyle;
  fontFamilies?: string[] = ['system'];
  fontFeatures?: TextFontFeatures[];
  fontSize?: number = 14;
  fontStyle?: FontStyle;
  foregroundColor?: InputColor;
  heightMultiplier?: number;
  halfLeading?: boolean;
  letterSpacing?: number;
  locale?: string;
  shadows?: TextShadow[];
  textBaseline?: TextBaseline;
  wordSpacing?: number;

  constructor(ts: TextStyle) {
    for (const [key, value] of Object.entries(ts)) {
      this[key as keyof TextStyle] = value;
    }
  }
}
