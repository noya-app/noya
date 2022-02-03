import React, { useEffect, useRef } from 'react';

import {
  Path as SkiaPath,
  useDrawing,
  Drawing,
} from '@shopify/react-native-skia';
import { PathComponentProps } from '../types';

const Path: React.FC<PathComponentProps> = (props) => {
  const { paint, path } = props;
  console.log('Path.render', paint.getColor());

  const onDraw = useDrawing({ paint, path }, ({ canvas }) => {
    console.log('onDraw', paint.getColor());
    canvas.drawPath(path._path, paint._paint);
  });

  return <Drawing onDraw={onDraw} />;
};

export default Path;
