import { Rect, insetRect } from '@noya-app/noya-geometry';
import { usePaint } from 'noya-react-canvaskit';
import { Primitives } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Rect as RCKRect } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { FloatingBubbleLabel } from './FloatingBubbleLabel';

interface Props {
  rect: Rect;
  includePartiallyContainedLayers?: boolean;
}

export default memo(function Marquee({
  rect,
  includePartiallyContainedLayers = true,
}: Props) {
  const CanvasKit = useCanvasKit();
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

  const alignedRect = useMemo((): Rect => insetRect(rect, -0.5), [rect]);
  const alignedBoundingRect = Primitives.rect(CanvasKit, alignedRect);

  return (
    <>
      <RCKRect rect={alignedBoundingRect} paint={fill} />
      <RCKRect rect={alignedBoundingRect} paint={stroke} />
      {!includePartiallyContainedLayers && (
        <FloatingBubbleLabel
          rect={alignedRect}
          text="Select enclosed"
          color={color}
          onlyShowWhenEnoughSpace
        />
      )}
    </>
  );
});
