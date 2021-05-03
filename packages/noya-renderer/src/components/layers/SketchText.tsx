import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Group,
  Text,
  useFontManager,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { memo, useMemo } from 'react';

interface Props {
  layer: Sketch.Text;
}

function getTextStyleAttributes(layer: Sketch.Text) {
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

function applyTextTransform(text: string, transform: Sketch.TextTransform) {
  switch (transform) {
    case Sketch.TextTransform.None:
      return text;
    case Sketch.TextTransform.Lowercase:
      return text.toLowerCase();
    case Sketch.TextTransform.Uppercase:
      return text.toUpperCase();
  }
}

export default memo(function SketchText({ layer }: Props) {
  const { CanvasKit } = useReactCanvasKit();
  const fontManager = useFontManager();

  const {
    fontSize,
    lineHeight,
    textHorizontalAlignment,
    textTransform,
    textDecoration,
  } = getTextStyleAttributes(layer);

  const paragraph = useMemo(() => {
    const heightMultiplier = lineHeight ? lineHeight / fontSize : undefined;

    const paragraphStyle = new CanvasKit.ParagraphStyle({
      // Note: We can put a heightMultiplier in text style, but it has no effect
      textStyle: {
        color: CanvasKit.BLACK,
        fontFamilies: ['Roboto'],
        fontSize,
      },
      textAlign: Primitives.textHorizontalAlignment(
        CanvasKit,
        textHorizontalAlignment,
      ),
      // TODO:
      // Using a strut for line height is somewhat different from how Sketch works.
      // Sketch does not apply the additional height to the first line, so we may
      // want to handle this differently or move the whole paragraph up to compensate.
      //
      // For more on struts: https://en.wikipedia.org/wiki/Strut_(typesetting)
      strutStyle: {
        fontFamilies: ['Roboto'],
        strutEnabled: true,
        forceStrutHeight: true,
        fontSize,
        heightMultiplier,
      },
    });

    const builder = CanvasKit.ParagraphBuilder.Make(
      paragraphStyle,
      fontManager,
    );

    layer.attributedString.attributes.forEach((attribute) => {
      const { location, length } = attribute;
      const string = layer.attributedString.string.substr(location, length);
      const style = Primitives.stringAttribute(
        CanvasKit,
        attribute,
        textDecoration,
      );
      builder.pushStyle(style);
      builder.addText(applyTextTransform(string, textTransform));
      builder.pop();
    });

    const paragraph = builder.build();
    paragraph.layout(layer.frame.width);

    return paragraph;
  }, [
    CanvasKit,
    fontSize,
    textHorizontalAlignment,
    lineHeight,
    fontManager,
    layer.attributedString.attributes,
    layer.attributedString.string,
    layer.frame.width,
    textDecoration,
    textTransform,
  ]);

  const element = (
    <Text
      paragraph={paragraph}
      rect={Primitives.rect(CanvasKit, layer.frame)}
    />
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  return opacity < 1 ? <Group opacity={opacity}>{element}</Group> : element;
});
