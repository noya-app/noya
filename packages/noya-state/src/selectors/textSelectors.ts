import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit, FontMgr } from 'canvaskit';
import { InteractionState, Primitives } from 'noya-state';
import { getTextStyleAttributes } from './textStyleSelectors';

export const getIsEditingText = (type: InteractionState['type']): boolean => {
  return type === 'editingText';
};

export function applyTextTransform(
  text: string,
  transform: Sketch.TextTransform,
) {
  switch (transform) {
    case Sketch.TextTransform.None:
      return text;
    case Sketch.TextTransform.Lowercase:
      return text.toLowerCase();
    case Sketch.TextTransform.Uppercase:
      return text.toUpperCase();
  }
}

export function getLayerParagraph(
  CanvasKit: CanvasKit,
  fontManager: FontMgr,
  layer: Sketch.Text,
) {
  const {
    fontSize,
    lineHeight,
    textHorizontalAlignment,
    textTransform,
    textDecoration,
  } = getTextStyleAttributes(layer);

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

  const builder = CanvasKit.ParagraphBuilder.Make(paragraphStyle, fontManager);

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

  builder.delete();

  paragraph.layout(layer.frame.width);

  return paragraph;
}
