import React, { memo } from 'react';

import { Rect } from 'noya-geometry';
import { Primitives } from 'noya-state';
import { useCanvasKit } from 'noya-renderer';
import { usePaint } from 'noya-react-canvaskit';
import { Rect as RCKRect } from '../contexts/ComponentsContext';

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
