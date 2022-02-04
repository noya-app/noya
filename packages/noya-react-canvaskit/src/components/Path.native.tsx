import React, { memo, useEffect, useRef } from 'react';

import { Path as SkiaPath } from '@shopify/react-native-skia';
import { PathComponentProps } from '../types';

const Path: React.FC<PathComponentProps> = (props) => {
  const { path, paint } = props;

  const skiaPaint = useRef(paint._paint);

  useEffect(() => {
    skiaPaint.current = paint._paint;
  }, [paint._paint]);

  return <SkiaPath path={path._path} paint={skiaPaint} />;
};

export default memo(Path);
