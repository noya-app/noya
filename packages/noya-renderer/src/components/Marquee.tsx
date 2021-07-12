import { usePaint } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import { Rect, Primitives } from 'noya-state';
import React, { memo } from 'react';
import { Rect as RCKRect } from '../ComponentsContext';

interface Props {
  rect: Rect;
}

export default memo(function Marquee({ rect }: Props) {
  const CanvasKit = useCanvasKit();

  const stroke = usePaint({
    color: CanvasKit.Color(220, 220, 220, 0.9),
    strokeWidth: 2,
    style: CanvasKit.PaintStyle.Stroke,
  });

  const fill = usePaint({
    color: CanvasKit.Color(255, 255, 255, 0.2),
    style: CanvasKit.PaintStyle.Fill,
  });

  const boundingRect = Primitives.rect(CanvasKit, rect);

  return (
    <>
      <RCKRect rect={boundingRect} paint={stroke} />
      <RCKRect rect={boundingRect} paint={fill} />
    </>
  );
});
