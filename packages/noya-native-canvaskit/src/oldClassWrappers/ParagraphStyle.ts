import { StrutStyle } from 'canvaskit';

import { TextAlign, TextDirection, TextHeightBehavior } from '../types';
import { SkiaTextStyle } from './TextStyle';

export class SkiaParagraphStyle {
  disableHinting?: boolean;
  ellipsis?: string;
  heightMultiplier?: number;
  maxLines?: number;
  strutStyle?: StrutStyle;
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  textHeightBehavior?: TextHeightBehavior;
  textStyle?: SkiaTextStyle;

  constructor({
    disableHinting,
    ellipsis,
    heightMultiplier,
    maxLines,
    strutStyle,
    textAlign,
    textDirection,
    textHeightBehavior,
    textStyle,
  }: SkiaParagraphStyle) {
    this.disableHinting = disableHinting;
    this.ellipsis = ellipsis;
    this.heightMultiplier = heightMultiplier;
    this.maxLines = maxLines;
    this.strutStyle = strutStyle;
    this.textAlign = textAlign;
    this.textDirection = textDirection;
    this.textHeightBehavior = textHeightBehavior;
    this.textStyle = textStyle;
  }
}
