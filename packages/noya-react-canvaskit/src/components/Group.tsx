import { ColorFilter } from 'canvaskit';
import { AffineTransform } from 'noya-geometry';
import { createElement, memo, ReactNode, useMemo } from 'react';
import { ClipProps, GroupComponentProps } from '../types';

interface GroupProps {
  opacity?: number;
  transform?: AffineTransform;
  children?: ReactNode;
  clip?: ClipProps;
  colorFilter?: ColorFilter;
}

export default memo(function Group(props: GroupProps) {
  const transform = useMemo(
    () => (props.transform ? props.transform.float32Array : undefined),
    [props.transform],
  );

  const elementProps: GroupComponentProps = useMemo(
    () => ({
      transform,
      children: props.children,
      opacity: props.opacity ?? 1,
      clip: props.clip,
      colorFilter: props.colorFilter,
    }),
    [transform, props.children, props.opacity, props.clip, props.colorFilter],
  );

  return createElement('Group', elementProps);
});
