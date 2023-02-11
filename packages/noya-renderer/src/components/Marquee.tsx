import { createBounds, insetRect, Rect } from 'noya-geometry';
import { usePaint } from 'noya-react-canvaskit';
import { Primitives, Selectors } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Rect as RCKRect, Text } from '../ComponentsContext';
import { useFontManager } from '../FontManagerContext';
import { useCanvasKit } from '../hooks/useCanvasKit';

interface Props {
  rect: Rect;
  includePartiallyContainedLayers: boolean;
}

const padding = {
  width: 6,
  height: 2,
};

export default memo(function Marquee({
  rect,
  includePartiallyContainedLayers,
}: Props) {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const { primary, secondary } = useTheme().colors;

  const color = includePartiallyContainedLayers ? primary : secondary;

  const stroke = usePaint({
    color,
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
    opacity: 0.9,
  });

  const fill = usePaint({
    color,
    style: CanvasKit.PaintStyle.Fill,
    opacity: 0.2,
  });

  const boundingRect = Primitives.rect(CanvasKit, insetRect(rect, -0.5));

  const text = 'Select enclosed';
  const paragraph = Selectors.getArtboardLabelParagraph(
    CanvasKit,
    fontManager,
    text,
    color,
  );
  const paragraphSize = Selectors.getArtboardLabelParagraphSize(
    CanvasKit,
    fontManager,
    text,
  );

  const bounds = useMemo(() => createBounds(rect), [rect]);

  const textRect = useMemo(
    () => ({
      x: bounds.midX - paragraphSize.width / 2,
      y: bounds.minY - paragraphSize.height - padding.height - 4,
      width: paragraphSize.width,
      height: paragraphSize.height,
    }),
    [bounds.midX, bounds.minY, paragraphSize.height, paragraphSize.width],
  );

  const backgroundRect = useMemo(
    () => insetRect(textRect, -padding.width, -padding.height),
    [textRect],
  );

  return (
    <>
      <RCKRect rect={boundingRect} paint={fill} />
      <RCKRect rect={boundingRect} paint={stroke} />
      {!includePartiallyContainedLayers && rect.width >= backgroundRect.width && (
        <>
          <RCKRect
            rect={Primitives.rect(CanvasKit, backgroundRect)}
            paint={fill}
            cornerRadius={backgroundRect.height / 2}
          />
          <Text
            paragraph={paragraph}
            rect={Primitives.rect(CanvasKit, textRect)}
          />
        </>
      )}
    </>
  );
});
