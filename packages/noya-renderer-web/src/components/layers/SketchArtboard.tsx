import Sketch from 'noya-file-format';
import { Rect } from 'noya-geometry';
import {
  ClipProps,
  useBlurMaskFilter,
  useDeletable,
  usePaint,
} from 'noya-react-canvaskit';
import {
  Group,
  Rect as RCKRect,
  Text,
  useCanvasKit,
  useZoom,
} from 'noya-renderer-web';
import { Primitives, Selectors } from 'noya-state';
import { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { useFontManager } from '../../FontManagerContext';
import { useRenderingMode } from '../../RenderingModeContext';
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
  const fontManager = useFontManager();
  const zoom = useZoom();

  const { colors } = useTheme();
  const textColor = isSymbolMaster ? colors.primary : colors.textMuted;

  const paragraph = useMemo(
    () =>
      Selectors.getArtboardLabelParagraph(
        CanvasKit,
        fontManager,
        text,
        textColor,
      ),
    [CanvasKit, fontManager, text, textColor],
  );

  const rect = useMemo(
    () =>
      Selectors.getArtboardLabelRect(layerFrame, {
        height: paragraph.getHeight(),
        width: paragraph.getMinIntrinsicWidth(),
      }),
    [layerFrame, paragraph],
  );

  useDeletable(paragraph);

  return (
    <Group transform={Selectors.getArtboardLabelTransform(rect, zoom)}>
      <Text
        rect={useMemo(
          () => Primitives.rect(CanvasKit, rect),
          [CanvasKit, rect],
        )}
        paragraph={paragraph}
      />
    </Group>
  );
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
}

export const SketchArtboardContent = memo(function SketchArtboardContent({
  layer,
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

  const renderingMode = useRenderingMode();
  const showBackground =
    renderingMode === 'interactive' ||
    (layer.hasBackgroundColor && layer.includeBackgroundColorInExport);

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
  const renderingMode = useRenderingMode();

  return (
    <>
      {renderingMode === 'interactive' && (
        <>
          <ArtboardLabel
            text={layer.name}
            layerFrame={layer.frame}
            isSymbolMaster={isSymbolMaster}
          />
          <ArtboardBlur layerFrame={layer.frame} />
        </>
      )}
      <SketchArtboardContent layer={layer} />
    </>
  );
});
