import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Rect } from 'noya-geometry';
import {
  ClipProps,
  useBlurMaskFilter,
  useDeletable,
  usePaint,
} from 'noya-react-canvaskit';
import {
  Group,
  Primitives,
  Rect as RCKRect,
  Text,
  useCanvasKit,
  useFontManager,
} from 'noya-renderer';
import { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import SketchGroup from './SketchGroup';

interface ArtboardLabelProps {
  text: string;
  layerFrame: Rect;
  isSymbolMaster: boolean;
}

const ArtboardLabel = memo(function ArtboardLabel({
  text,
  layerFrame,
  isSymbolMaster,
}: ArtboardLabelProps) {
  const CanvasKit = useCanvasKit();
  const { colors } = useTheme();
  const textColor = isSymbolMaster ? colors.primary : colors.textMuted;
  const fontManager = useFontManager();

  const paragraph = useMemo(() => {
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
    builder.addText(text);

    const paragraph = builder.build();
    paragraph.layout(10000);

    builder.delete();

    return paragraph;
  }, [CanvasKit, fontManager, text, textColor]);

  useDeletable(paragraph);

  const labelRect = Primitives.rect(CanvasKit, {
    x: layerFrame.x + 3,
    y: layerFrame.y - paragraph.getHeight() - 3,
    width: layerFrame.width,
    height: layerFrame.height,
  });

  return <Text rect={labelRect} paragraph={paragraph} />;
});

interface ArtboardBlurProps {
  layerFrame: Rect;
}

const ArtboardBlur = memo(function ArtboardBlur({
  layerFrame,
}: ArtboardBlurProps) {
  const CanvasKit = useCanvasKit();

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

  const blurRect = Primitives.rect(CanvasKit, {
    ...layerFrame,
    y: layerFrame.y + 1,
  });

  return <RCKRect rect={blurRect} paint={blur} />;
});

interface SketchArtboardContentProps {
  layer: Sketch.Artboard | Sketch.SymbolMaster;
  showBackground: boolean;
}

export const SketchArtboardContent = memo(function SketchArtboardContent({
  layer,
  showBackground,
}: SketchArtboardContentProps) {
  const CanvasKit = useCanvasKit();

  const paint = usePaint({
    color: layer.hasBackgroundColor
      ? Primitives.color(CanvasKit, layer.backgroundColor)
      : CanvasKit.WHITE,
    style: CanvasKit.PaintStyle.Fill,
  });

  const rect = Primitives.rect(CanvasKit, layer.frame);

  const clip: ClipProps = useMemo(
    () => ({
      path: rect,
      op: CanvasKit.ClipOp.Intersect,
    }),
    [CanvasKit.ClipOp.Intersect, rect],
  );

  return (
    <>
      {showBackground && <RCKRect rect={rect} paint={paint} />}
      <Group clip={clip}>
        <SketchGroup layer={layer} />
      </Group>
    </>
  );
});

interface Props {
  layer: Sketch.Artboard | Sketch.SymbolMaster;
  isSymbolMaster: boolean;
}

export default memo(function SketchArtboard({ layer, isSymbolMaster }: Props) {
  return (
    <>
      <ArtboardLabel
        text={layer.name}
        layerFrame={layer.frame}
        isSymbolMaster={isSymbolMaster}
      />
      <ArtboardBlur layerFrame={layer.frame} />
      <SketchArtboardContent layer={layer} showBackground={true} />
    </>
  );
});
