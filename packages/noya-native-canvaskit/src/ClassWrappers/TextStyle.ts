import type {
  FontStyle,
  InputColor,
  TextShadow,
  TextFontFeatures,
} from 'canvaskit';

import { TextBaseline, DecorationStyle } from '../types';
import { SkiaCanvasKit } from '../SkiaCanvasKit';

export class SkiaTextStyle {
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

  constructor(ts: SkiaTextStyle) {
    for (const [key, value] of Object.entries(ts)) {
      this[key as keyof SkiaTextStyle] = value;
    }
  }
}
