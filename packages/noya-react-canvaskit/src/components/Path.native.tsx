import React, { memo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { PathNative, PaintNative } from 'noya-native-canvaskit';

interface NativePathProps {
  path: PathNative;
  paint: PaintNative;
}

const Path: React.FC<NativePathProps> = (props) => {
  const onDraw = useDrawing(props, ({ canvas }, { path, paint }) => {
    canvas.drawPath(path.getRNSPath(), paint.getRNSkiaPaint());
  });

  // @ts-ignore
  return <Drawing onDraw={onDraw} {...props} skipProcessing />;
};

export default memo(Path);
