import React, { PropsWithChildren, useMemo } from 'react';

import { ColorFilter, ImageFilter } from 'canvaskit';
import { AffineTransform } from 'noya-geometry';
import { Group as SkiaGroup } from '@shopify/react-native-skia';
import { ClipProps } from '../types';

interface GroupProps {
  opacity?: number;
  transform?: AffineTransform;
  clip?: ClipProps;
  colorFilter?: ColorFilter;
  imageFilter?: ImageFilter;
  backdropImageFilter?: ImageFilter;
}

const Group: React.FC<PropsWithChildren<GroupProps>> = (props) => {
  // TODO: handle rest of the props
  const {
    // opacity,
    children,
    // clip,
    // colorFilter,
    // imageFilter,
    // backdropImageFilter,
  } = props;

  const transform = useMemo(() => {
    if (props.transform) {
      const { x, y } = props.transform.applyTo({ x: 1, y: 1 });

      return [{ translateX: x }, { translateY: y }];
    }

    return [];
  }, [props.transform]);

  return <SkiaGroup transform={transform}>{children}</SkiaGroup>;
};

export default Group;
