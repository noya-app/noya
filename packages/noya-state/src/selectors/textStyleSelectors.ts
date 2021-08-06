import Sketch from '@sketch-hq/sketch-file-format-ts';
import getMultiValueEvery from '../utils/getMultiValueEvery';

type EncodedAttribute = Sketch.TextStyle['encodedAttributes'] | undefined;

function getTextStyleColor(encodedAttributes: EncodedAttribute) {
  const color: Sketch.Color = {
    _class: 'color',
    red: 0.5,
    blue: 0.5,
    green: 0.5,
    alpha: 0.5,
  };

  return encodedAttributes?.MSAttributedStringColorAttribute ?? color;
}

function getTextFontFamily(encodedAttributes: EncodedAttribute) {
  return (
    encodedAttributes?.MSAttributedStringFontAttribute.attributes.name ??
    'Helvetica'
  );
}

function getTextFontSize(
  encodedAttributesArray: EncodedAttribute[],
  encodedAttributes: EncodedAttribute,
  attributes: Sketch.StringAttribute[],
) {
  return getMultiValueEvery<number | undefined>(
    encodedAttributesArray.map(
      (encodedAttribute) =>
        encodedAttribute?.MSAttributedStringFontAttribute.attributes.size,
    ),
  ) &&
    getMultiValueEvery<number | undefined>(
      attributes.map(
        (a) => a.attributes.MSAttributedStringFontAttribute.attributes.size,
      ),
    )
    ? encodedAttributes?.MSAttributedStringFontAttribute.attributes.size
    : undefined;
}

function getTextLineHeight(
  encodedAttributesArray: EncodedAttribute[],
  paragraphStyle: Sketch.ParagraphStyle | undefined,
  attributes: Sketch.StringAttribute[],
) {
  return getMultiValueEvery<number | undefined>(
    encodedAttributesArray.map(
      (encodedAttribute) => encodedAttribute?.paragraphStyle?.maximumLineHeight,
    ),
  ) &&
    getMultiValueEvery<number | undefined>(
      attributes.map((a) => a.attributes.paragraphStyle?.maximumLineHeight),
    )
    ? paragraphStyle?.maximumLineHeight ?? 22
    : undefined;
}

function getHorizontalAlignment(
  encodedAttributesArray: EncodedAttribute[],
  paragraphStyle: Sketch.ParagraphStyle | undefined,
  attributes: Sketch.StringAttribute[],
) {
  return getMultiValueEvery<Sketch.TextHorizontalAlignment | undefined>(
    encodedAttributesArray.map(
      (encodedAttribute) => encodedAttribute?.paragraphStyle?.alignment,
    ),
  ) &&
    getMultiValueEvery<Sketch.TextHorizontalAlignment | undefined>(
      attributes.map((a) => a.attributes.paragraphStyle?.alignment),
    )
    ? paragraphStyle?.alignment ?? Sketch.TextHorizontalAlignment.Left
    : undefined;
}

function getTextTransformation(
  encodedAttributesArray: EncodedAttribute[],
  encodedAttributes: Sketch.TextStyle['encodedAttributes'] | undefined,
) {
  return getMultiValueEvery<Sketch.TextTransform | undefined>(
    encodedAttributesArray.map(
      (encodedAttribute) =>
        encodedAttribute?.MSAttributedStringTextTransformAttribute,
    ),
  )
    ? encodedAttributes?.MSAttributedStringTextTransformAttribute ??
        Sketch.TextTransform.None
    : undefined;
}

function getTextDecoration(encodedAttributes: EncodedAttribute) {
  return encodedAttributes?.underlineStyle
    ? ('underline' as const)
    : encodedAttributes?.strikethroughStyle
    ? ('strikethrough' as const)
    : ('none' as const);
}

function getTextLetterSpacing(
  encodedAttributesArray: EncodedAttribute[],
  encodedAttributes: EncodedAttribute,
  attributes: Sketch.StringAttribute[],
) {
  return getMultiValueEvery<number | undefined>(
    encodedAttributesArray.map((encodedAttribute) => encodedAttribute?.kerning),
  ) &&
    getMultiValueEvery<number | undefined>(
      attributes.map((a) => a.attributes.kerning),
    )
    ? encodedAttributes?.kerning || 0
    : undefined;
}

function getTextParagraphSpacing(
  encodedAttributesArray: EncodedAttribute[],
  paragraphStyle: Sketch.ParagraphStyle | undefined,
  attributes: Sketch.StringAttribute[],
) {
  return getMultiValueEvery<number | undefined>(
    encodedAttributesArray.map(
      (encodedAttribute) => encodedAttribute?.paragraphStyle?.paragraphSpacing,
    ),
  ) &&
    getMultiValueEvery<number | undefined>(
      attributes.map((a) => a.attributes.paragraphStyle?.paragraphSpacing),
    )
    ? paragraphStyle?.paragraphSpacing || 0
    : undefined;
}

function getTextVerticalAlignment(
  encodedAttributesArray: EncodedAttribute[],
  encodedAttributes: EncodedAttribute | undefined,
) {
  return getMultiValueEvery<number | undefined>(
    encodedAttributesArray.map(
      (encodedAttribute) => encodedAttribute?.textStyleVerticalAlignmentKey,
    ),
  )
    ? encodedAttributes?.textStyleVerticalAlignmentKey ??
        Sketch.TextVerticalAlignment.Top
    : undefined;
}

function getTextAlignment(layers: Sketch.Text[]) {
  return getMultiValueEvery<Sketch.TextBehaviour | undefined>(
    layers.map((l: Sketch.Text) => l?.textBehaviour),
  )
    ? layers[0]?.textBehaviour ?? 0
    : undefined;
}

type TextStyles = Sketch.Text | Sketch.Style;

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
    textDecoration: encodedAttributes?.underlineStyle
      ? ('underline' as const)
      : encodedAttributes?.strikethroughStyle
      ? ('strikethrough' as const)
      : ('none' as const),
  };
}

export const getEditableTextStyleAttributes = (array: TextStyles[]) => {
  const first = array[0];
  const textStyle =
    first._class === 'text' ? first.style?.textStyle : first.textStyle;
  const encodedAttributes = textStyle?.encodedAttributes;
  const paragraphStyle = encodedAttributes?.paragraphStyle;

  const attributes =
    first._class === 'text' ? first.attributedString.attributes : [];

  const encodedAttributesArray = array.map((value) =>
    value._class === 'text'
      ? value.style?.textStyle?.encodedAttributes
      : value.textStyle?.encodedAttributes,
  );

  return {
    fontColor: getTextStyleColor(encodedAttributes),
    fontFamily: getTextFontFamily(encodedAttributes),
    fontSize: getTextFontSize(
      encodedAttributesArray,
      encodedAttributes,
      attributes,
    ),
    lineHeight: getTextLineHeight(
      encodedAttributesArray,
      paragraphStyle,
      attributes,
    ),
    horizontalAlignment: getHorizontalAlignment(
      encodedAttributesArray,
      paragraphStyle,
      attributes,
    ),
    textTransform: getTextTransformation(
      encodedAttributesArray,
      encodedAttributes,
    ),
    textDecoration: getTextDecoration(encodedAttributes),
    letterSpacing: getTextLetterSpacing(
      encodedAttributesArray,
      encodedAttributes,
      attributes,
    ),
    paragraphSpacing: getTextParagraphSpacing(
      encodedAttributesArray,
      paragraphStyle,
      attributes,
    ),
    verticalAlignment: getTextVerticalAlignment(
      encodedAttributesArray,
      encodedAttributes,
    ),
    fontAlignment: getTextAlignment(
      array.flatMap((value) => (value._class === 'text' ? [value] : [])),
    ),
  };
};
