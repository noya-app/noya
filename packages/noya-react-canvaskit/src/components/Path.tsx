import { createElement, memo, useMemo } from 'react';
import usePaint from '../hooks/usePaint';
import { PathComponentProps } from '../types';

export default memo(function Path(props: PathComponentProps) {
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
