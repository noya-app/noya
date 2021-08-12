import Sketch from '@sketch-hq/sketch-file-format-ts';
import { SketchModel } from 'noya-sketch-model';
import { SimpleTextDecoration } from '../primitives';

export function getTextDecoration(
  encodedAttributes: Pick<
    Sketch.TextStyle['encodedAttributes'],
    'underlineStyle' | 'strikethroughStyle'
  >,
): SimpleTextDecoration {
  return encodedAttributes?.underlineStyle
    ? ('underline' as const)
    : encodedAttributes?.strikethroughStyle
    ? ('strikethrough' as const)
    : ('none' as const);
}

export function getTextStyleAttributes(layer: Sketch.Text) {
  const encodedAttributes = layer.style?.textStyle?.encodedAttributes;
  const paragraphStyle = encodedAttributes?.paragraphStyle;

  return {
    fontSize:
      encodedAttributes?.MSAttributedStringFontAttribute.attributes.size ?? 12,
    lineHeight: paragraphStyle?.maximumLineHeight,
    textHorizontalAlignment:
      paragraphStyle?.alignment ?? Sketch.TextHorizontalAlignment.Left,
    textTransform:
      encodedAttributes?.MSAttributedStringTextTransformAttribute ??
      Sketch.TextTransform.None,
    textDecoration: encodedAttributes
      ? getTextDecoration(encodedAttributes)
      : 'none',
  };
}

export function getEncodedStringAttributes(
  style: Sketch.Style | undefined,
): Sketch.StringAttribute['attributes'] {
  const encodedAttributes = style?.textStyle?.encodedAttributes;

  return {
    kerning: encodedAttributes?.kerning,
    textStyleVerticalAlignmentKey:
      encodedAttributes?.textStyleVerticalAlignmentKey,
    MSAttributedStringFontAttribute:
      encodedAttributes?.MSAttributedStringFontAttribute ??
      SketchModel.fontDescriptor(),
    MSAttributedStringColorAttribute:
      encodedAttributes?.MSAttributedStringColorAttribute,
    paragraphStyle: encodedAttributes?.paragraphStyle,
  };
}

export function encodeFontName(fontFamily: string, variant?: string) {
  return variant ? `${fontFamily}-${variant}` : fontFamily;
}

export function decodeFontName(
  fontName: string,
): { fontFamily: string; variant?: string } {
  const [fontFamily, variant] = fontName.split('-');

  return { fontFamily, variant: variant || undefined };
}
