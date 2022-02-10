import React, { memo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { SkiaPath, SkiaPaint } from 'noya-native-canvaskit';

interface NativePathProps {
  path: SkiaPath;
  paint: SkiaPaint;
}

const Path: React.FC<NativePathProps> = (props) => {
  const onDraw = useDrawing(props, ({ canvas }, { path, paint }) => {
    canvas.drawPath(path.getRNSkiaPath(), paint.getRNSkiaPaint());
  });

  // @ts-ignore
  return <Drawing onDraw={onDraw} {...props} skipProcessing />;
};

export default memo(Path);
