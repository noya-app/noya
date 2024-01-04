import { createBounds, insetRect, Rect } from '@noya-app/noya-geometry';
import { Rect as RCKRect, Text } from '@noya-app/noya-graphics';
import { useFill, usePaint } from 'noya-react-canvaskit';
import { Primitives, Selectors } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { useFontManager } from '../FontManagerContext';
import { useCanvasKit } from '../hooks/useCanvasKit';

interface Props {
  rect: Rect;
  text: string;
  color?: string;
  onlyShowWhenEnoughSpace?: boolean;
}

const padding = {
  width: 6,
  height: 2,
};

export const FloatingBubbleLabel = memo(function FloatingBubbleLabel({
  rect,
  color: colorProp,
  text,
  onlyShowWhenEnoughSpace,
}: Props) {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const {
    primary,
    canvas: { background },
  } = useTheme().colors;
  const color = colorProp ?? primary;

  const fill = usePaint({
    color,
    style: CanvasKit.PaintStyle.Fill,
    opacity: 0.2,
  });

  // Use a mostly opaque background so that the text is easier to read
  // when the background is a similar color.
  const backgroundPaint = useFill({
    color: background,
    opacity: 0.9,
  });

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
      {!(onlyShowWhenEnoughSpace && backgroundRect.width > rect.width) && (
        <>
          <RCKRect
            rect={Primitives.rect(CanvasKit, backgroundRect)}
            paint={backgroundPaint}
            cornerRadius={backgroundRect.height / 2}
          />
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
