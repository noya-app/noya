import { useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { insetRect, Rect } from 'noya-geometry';
import {
  ClipProps,
  useBlurMaskFilter,
  useColor,
  useDeletable,
  usePaint,
  useStroke,
} from 'noya-react-canvaskit';
import { SketchModel } from 'noya-sketch-model';
import { Primitives, Selectors } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Group, Rect as RCKRect, Text } from '../../ComponentsContext';
import { useFontManager } from '../../FontManagerContext';
import { useCanvasKit } from '../../hooks/useCanvasKit';
import { useDotFill } from '../../hooks/useDotFill';
import { useRenderingMode } from '../../RenderingModeContext';
import { useZoom } from '../../ZoomContext';
import SketchGroup from './SketchGroup';
import { BaseLayerProps } from './types';

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
  const {
    preferences: { showDotGrid },
  } = useWorkspace();

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

  const stroke = useStroke({
    color: useColor('#e0e0e0'),
    strokeWidth: 1,
  });

  if (showDotGrid) {
    return (
      <RCKRect
        rect={Primitives.rect(CanvasKit, insetRect(layerFrame, -0.5))}
        paint={stroke}
      />
    );
  }

  return <RCKRect rect={blurRect} paint={blur} />;
});

interface SketchArtboardContentProps extends BaseLayerProps {
  layer: Sketch.Artboard | Sketch.SymbolMaster;
}

export const SketchArtboardContent = memo(function SketchArtboardContent({
  layer,
  SketchLayer,
}: SketchArtboardContentProps) {
  const {
    preferences: { showDotGrid },
  } = useWorkspace();
  const CanvasKit = useCanvasKit();
  const zoom = useZoom();

  const paint = useDotFill({
    gridSize: 10,
    frame: layer.frame,
    backgroundColor: layer.hasBackgroundColor
      ? layer.backgroundColor
      : SketchModel.WHITE,
    foregroundColor:
      showDotGrid && zoom >= 1 ? SketchModel.BLACK : SketchModel.WHITE,
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
        <SketchGroup SketchLayer={SketchLayer} layer={layer} />
      </Group>
    </>
  );
});

interface Props extends BaseLayerProps {
  layer: Sketch.Artboard | Sketch.SymbolMaster;
  isSymbolMaster: boolean;
}

export default memo(function SketchArtboard({
  layer,
  isSymbolMaster,
  SketchLayer,
}: Props) {
  const {
    preferences: { showDotGrid },
  } = useWorkspace();
  const renderingMode = useRenderingMode();

  return (
    <>
      {renderingMode === 'interactive' && (
        <>
          {!showDotGrid && (
            <ArtboardLabel
              text={layer.name}
              layerFrame={layer.frame}
              isSymbolMaster={isSymbolMaster}
            />
          )}
          <ArtboardBlur layerFrame={layer.frame} />
        </>
      )}
      <SketchArtboardContent SketchLayer={SketchLayer} layer={layer} />
    </>
  );
});
