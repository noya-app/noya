import React, { memo, useMemo } from 'react';

import { Path as SkiaPath } from '@shopify/react-native-skia';
import { PathComponentProps } from '../types';

const Path: React.FC<PathComponentProps> = (props) => {
  const { paint, path } = props;

  // TODO: fixme, add some getter?
  return <SkiaPath paint={paint._paint} path={path._path} />;
};

export default Path;
