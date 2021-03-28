import Sketch from '@sketch-hq/sketch-file-format-ts';
import { AffineTransform } from 'noya-geometry';
import {
  ClipProps,
  Group,
  Rect,
  Text,
  useBlurMaskFilter,
  useFontManager,
  usePaint,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import SketchLayer from './SketchLayer';

interface Props {
  layer: Sketch.Artboard;
}

export default memo(function SketchArtboard({ layer }: Props) {
  const { CanvasKit } = useReactCanvasKit();
  const textColor = useTheme().colors.textMuted;
  const fontManager = useFontManager();

  const paint = usePaint({
    color: CanvasKit.WHITE,
    style: CanvasKit.PaintStyle.Fill,
  });

  const maskFilter = useBlurMaskFilter({
    style: CanvasKit.BlurStyle.Normal,
    sigma: 2,
    respectCTM: true,
  });

  const blur = usePaint({
    style: CanvasKit.BlurStyle.Normal,
    color: CanvasKit.BLACK,
    opacity: 0.2,
    maskFilter,
  });

  const rect = Primitives.rect(CanvasKit, layer.frame);
  const blurRect = Primitives.rect(CanvasKit, {
    ...layer.frame,
    y: layer.frame.y + 1,
  });

  const transform = useMemo(
    () => AffineTransform.translation(layer.frame.x, layer.frame.y),
    [layer.frame.x, layer.frame.y],
  );

  const clip: ClipProps = useMemo(
    () => ({
      path: rect,
      op: CanvasKit.ClipOp.Intersect,
    }),
    [CanvasKit.ClipOp.Intersect, rect],
  );

  const labelParagraph = useMemo(() => {
    const paragraphStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        color: CanvasKit.parseColorString(textColor),
        fontSize: 11,
        fontFamilies: ['Roboto'],
        letterSpacing: 0.2,
      },
    });

    const builder = CanvasKit.ParagraphBuilder.Make(
      paragraphStyle,
      fontManager,
    );
    builder.addText(layer.name);

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, fontManager, layer.name, textColor]);

  const labelRect = Primitives.rect(CanvasKit, {
    x: layer.frame.x + 3,
    y: layer.frame.y - labelParagraph.getHeight() - 3,
    width: layer.frame.width,
    height: layer.frame.height,
  });

  const childrenElements = useMemo(
    () =>
      layer.layers.map((layer) => (
        <SketchLayer key={layer.do_objectID} layer={layer} />
      )),
    [layer.layers],
  );

  return (
    <>
      <Text rect={labelRect} paragraph={labelParagraph} />
      <Rect rect={blurRect} paint={blur} />
      <Rect rect={rect} paint={paint} />
      <Group transform={transform} clip={clip}>
        {childrenElements}
      </Group>
    </>
  );
});
