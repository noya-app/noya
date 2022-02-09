import React, { memo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { SkiaPaint } from 'noya-skia-canvaskit';
import { LTRBArrayToRect } from 'noya-geometry';

interface RectProps {
  rect: Float32Array;
  cornerRadius?: number;
  paint: SkiaPaint;
}

const Rect: React.FC<RectProps> = (props) => {
  const onDraw = useDrawing(props, ({ canvas }, rectProps) => {
    const rect = LTRBArrayToRect(rectProps.rect);

    canvas.drawRect(rect, rectProps.paint.getRNSkiaPaint());
  });

  // @ts-ignore
  return <Drawing onDraw={onDraw} {...props} skipProcessing />;
};

export default memo(Rect);
