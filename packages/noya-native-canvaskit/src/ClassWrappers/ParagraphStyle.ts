import {
  EmbindEnumEntity,
  ParagraphStyle,
  StrutStyle,
  TextStyle,
} from 'canvaskit';

export class SkiaParagraphStyle implements ParagraphStyle {
  disableHinting?: boolean;
  ellipsis?: string;
  heightMultiplier?: number;
  maxLines?: number;
  strutStyle?: StrutStyle;
  textAlign?: EmbindEnumEntity;
  textDirection?: EmbindEnumEntity;
  textHeightBehavior?: EmbindEnumEntity;
  textStyle?: TextStyle;

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
  }: ParagraphStyle) {
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
