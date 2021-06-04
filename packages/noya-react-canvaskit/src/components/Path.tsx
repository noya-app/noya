import { Paint, Path } from 'canvaskit';
import { createElement, memo, useMemo } from 'react';
import usePaint, { PaintParameters } from '../hooks/usePaint';
import { PathComponentProps } from '../types';

interface PathProps {
  path: Path;
  paint: Paint | PaintParameters;
}

export default memo(function Path(props: PathProps) {
  const paint = usePaint(props.paint);

  const elementProps: PathComponentProps = useMemo(
    () => ({
      paint,
      path: props.path,
    }),
    [paint, props.path],
  );

  return createElement('Path', elementProps);
});
