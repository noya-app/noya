import { AffineTransform } from '@noya-app/noya-geometry';
import { ColorFilter, ImageFilter } from '@noya-app/noya-canvaskit';
import { ReactNode, createElement, memo, useMemo } from 'react';
import { DropShadow } from '../filters/ImageFilter';
import { ClipProps, GroupComponentProps } from '../types';

interface GroupProps {
  opacity?: number;
  transform?: AffineTransform;
  children?: ReactNode;
  clip?: ClipProps;
  colorFilter?: ColorFilter;
  imageFilter?: ImageFilter | DropShadow;
  backdropImageFilter?: ImageFilter;
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
      backdropImageFilter: props.backdropImageFilter,
    }),
    [
      transform,
      props.children,
      props.opacity,
      props.clip,
      props.colorFilter,
      props.imageFilter,
      props.backdropImageFilter,
    ],
  );

  return createElement('Group', elementProps);
});
