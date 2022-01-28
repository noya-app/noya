import React, { useEffect, useRef } from 'react';

import { Path as SkiaPath } from '@shopify/react-native-skia';
import { PathComponentProps } from '../types';

const Path: React.FC<PathComponentProps> = (props) => {
  const { paint, path } = props;
  const skiaPaint = useRef(paint._paint);

  useEffect(() => {
    skiaPaint.current = paint._paint;
  }, [paint._paint]);

  // TODO: fixme, add some getter?
  return <SkiaPath paint={skiaPaint} path={path._path} />;
};

export default Path;
