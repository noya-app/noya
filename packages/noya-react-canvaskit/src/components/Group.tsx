import { AffineTransform } from 'noya-state/src/utils/AffineTransform';
import { createElement, memo, ReactNode, useMemo } from 'react';
import { ClipProps, GroupComponentProps } from '../types';

interface GroupProps {
  opacity?: number;
  transform?: AffineTransform;
  children?: ReactNode;
  clip?: ClipProps;
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
    }),
    [transform, props.children, props.opacity, props.clip],
  );

  return createElement('Group', elementProps);
});
