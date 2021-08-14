import Sketch from '@sketch-hq/sketch-file-format-ts';
import { SketchModel } from 'noya-sketch-model';
import { Layers } from 'noya-state';
import { unique } from 'noya-utils';
import { SimpleTextDecoration } from '../primitives';
import { ApplicationState } from '../reducers/applicationReducer';
import { toTextSpans } from './attributedStringSelectors';

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

  const spans = toTextSpans(layer.attributedString);

  const fontNames = [
    ...(encodedAttributes
      ? [encodedAttributes.MSAttributedStringFontAttribute.attributes.name]
      : []),
    ...spans.map(
      (span) => span.attributes.MSAttributedStringFontAttribute.attributes.name,
    ),
  ];

  return {
    fontNames: unique(fontNames),
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

export function getAllFontNames(state: ApplicationState) {
  const fontNames = state.sketch.pages.flatMap((page) => {
    const textLayers = Layers.findAll(
      page,
      Layers.isTextLayer,
    ) as Sketch.Text[];

    return textLayers.flatMap((layer) =>
      layer.style?.textStyle
        ? [
            layer.style.textStyle.encodedAttributes
              .MSAttributedStringFontAttribute.attributes.name,
            ...toTextSpans(layer.attributedString).map(
              (span) =>
                span.attributes.MSAttributedStringFontAttribute.attributes.name,
            ),
          ]
        : [],
    );
  });

  return unique(fontNames);
}
