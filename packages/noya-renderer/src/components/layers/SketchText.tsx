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

export default memo(function SketchText({ layer }: Props) {
  const { CanvasKit } = useReactCanvasKit();
  const fontManager = useFontManager();

  const paragraph = useMemo(() => {
    const paragraphStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        color: CanvasKit.BLACK,
        fontFamilies: ['Roboto'],
      },
      textAlign: CanvasKit.TextAlign.Left,
      // maxLines: 7,
      // ellipsis: '...',
    });

    const builder = CanvasKit.ParagraphBuilder.Make(
      paragraphStyle,
      fontManager,
    );

    layer.attributedString.attributes.forEach((attribute) => {
      const { location, length } = attribute;
      const string = layer.attributedString.string.substr(location, length);
      const style = Primitives.stringAttribute(CanvasKit, attribute);
      builder.pushStyle(style);
      builder.addText(string);
      builder.pop();
    });

    const paragraph = builder.build();
    paragraph.layout(layer.frame.width);

    return paragraph;
  }, [
    CanvasKit,
    fontManager,
    layer.attributedString.attributes,
    layer.attributedString.string,
    layer.frame.width,
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
