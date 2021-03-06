import { Paint } from 'canvaskit-wasm';
import { createElement, memo, useMemo } from 'react';
import usePaint, { PaintParameters } from '../hooks/usePaint';
import useRect, { RectParameters } from '../hooks/useRect';
import { RectComponentProps } from '../types';

interface RectProps {
  rect: RectParameters;
  paint: Paint | PaintParameters;
}

export default memo(function Rect(props: RectProps) {
  const rect = useRect(props.rect);
  const paint = usePaint(props.paint);

  const elementProps: RectComponentProps = useMemo(
    () => ({
      rect,
      paint,
    }),
    [rect, paint],
  );

  return createElement('Rect', elementProps);
});
