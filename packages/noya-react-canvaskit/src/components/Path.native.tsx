import React, { memo } from 'react';
import { createDrawing } from '@shopify/react-native-skia';

import { PathNative, PaintNative } from 'noya-native-canvaskit';

interface NativePathProps {
  path: PathNative;
  paint: PaintNative;
}

const onDraw = createDrawing<NativePathProps>(function onDraw(
  { canvas },
  { path, paint },
) {
  canvas.drawPath(path.getRNSPath(), paint.getRNSkiaPaint());
});

const Path: React.FC<NativePathProps> = (props) => {
  return <skDrawing onDraw={onDraw} {...props} skipProcessing />;
};

export default memo(Path);
