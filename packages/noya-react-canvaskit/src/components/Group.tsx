import { ColorFilter, ImageFilter } from 'canvaskit';
import { AffineTransform } from 'noya-geometry';
import { createElement, memo, ReactNode, useMemo } from 'react';
import { ClipProps, GroupComponentProps } from '../types';

interface GroupProps {
  opacity?: number;
  transform?: AffineTransform;
  children?: ReactNode;
  clip?: ClipProps;
  colorFilter?: ColorFilter;
  imageFilter?: ImageFilter;
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
      imageFilter: props.imageFilter,
    }),
    [
      transform,
      props.children,
      props.opacity,
      props.clip,
      props.colorFilter,
      props.imageFilter,
    ],
  );

  return createElement('Group', elementProps);
});
