import { insetRect, Rect } from 'noya-geometry';
import { usePaint } from 'noya-react-canvaskit';
import { Primitives } from 'noya-state';
import React, { memo } from 'react';
import { useTheme } from 'styled-components';
import { Rect as RCKRect } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';

interface Props {
  rect: Rect;
}

export default memo(function Marquee({ rect }: Props) {
  const CanvasKit = useCanvasKit();
  const color = useTheme().colors.primary;

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

  return (
    <>
      <RCKRect rect={boundingRect} paint={stroke} />
      <RCKRect rect={boundingRect} paint={fill} />
    </>
  );
});
