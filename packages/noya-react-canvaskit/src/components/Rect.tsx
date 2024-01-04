import { Paint } from '@noya-app/noya-canvaskit';
import { createElement, memo, useMemo } from 'react';
import usePaint from '../hooks/usePaint';
import useRect, { RectParameters } from '../hooks/useRect';
import { RectComponentProps } from '../types';

interface RectProps {
  rect: RectParameters;
  cornerRadius?: number;
  paint: Paint;
}

export default memo(function Rect(props: RectProps) {
  const rect = useRect(props.rect);
  const paint = usePaint(props.paint);

  const elementProps: RectComponentProps = useMemo(
    () => ({
      rect,
      paint,
      cornerRadius: props.cornerRadius,
    }),
    [rect, paint, props.cornerRadius],
  );

  return createElement('Rect', elementProps);
});
