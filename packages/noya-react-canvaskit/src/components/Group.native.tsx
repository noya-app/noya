import React from 'react';

import { Group as SkiaGroup } from '@shopify/react-native-skia';
import { GroupComponentProps } from '../types';

const Group: React.FC<GroupComponentProps> = (props) => {
  // TODO: handle rest of the props
  const {
    // transform,
    // opacity,
    children,
    // clip,
    // colorFilter,
    // imageFilter,
    // backdropImageFilter,
  } = props;

  return <SkiaGroup>{children}</SkiaGroup>;
};

export default Group;
