import Sketch from '@sketch-hq/sketch-file-format-ts';
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
