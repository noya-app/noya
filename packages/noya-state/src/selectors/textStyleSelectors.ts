import Sketch from '@sketch-hq/sketch-file-format-ts';
import { getFontFamilyId, isValidFontVariant } from 'noya-google-fonts';
import { FontID } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { Layers } from 'noya-state';
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

  const uniqueFontNames = [...new Set(fontNames)];

  // const font = Selectors.decodeFontName(fontName);

  // const fontVariant =
  //   font.fontVariant && isValidFontVariant(font.fontVariant)
  //     ? font.fontVariant
  //     : 'regular';

  return {
    fontIds: uniqueFontNames.flatMap((fontName) => {
      const font = decodeFontName(fontName);
      const fontId = encodeFontId(font.fontFamily, font.fontVariant);
      return fontId ? [fontId] : [];
    }),
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

export function encodeFontId(
  fontFamily: string,
  fontVariant: string = 'regular',
): FontID | undefined {
  const fontFamilyId = getFontFamilyId(fontFamily);

  if (!fontFamilyId || !isValidFontVariant(fontVariant)) return;

  return FontID.make(fontFamilyId, fontVariant);
}

export function decodeFontName(
  fontName: string,
): { fontFamily: string; fontVariant?: string } {
  const [fontFamily, fontVariant] = fontName.split('-');

  return { fontFamily, fontVariant: fontVariant || undefined };
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

  return [...new Set(fontNames)];
}
