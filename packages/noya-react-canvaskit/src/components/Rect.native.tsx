import React, { memo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { SkiaPaint } from 'noya-native-canvaskit';
import { LTRBArrayToRect } from 'noya-geometry';

interface RectProps {
  rect: Float32Array;
  cornerRadius?: number;
  paint: SkiaPaint;
}

const Rect: React.FC<RectProps> = (props) => {
  const onDraw = useDrawing(
    props,
    ({ canvas }, { rect, paint, cornerRadius }) => {
      const iRect = LTRBArrayToRect(rect);

      if (cornerRadius) {
        canvas.drawRRect(
          { rect: iRect, rx: cornerRadius, ry: cornerRadius },
          paint.getRNSkiaPaint(),
        );
      } else {
        canvas.drawRect(iRect, paint.getRNSkiaPaint());
      }
    },
  );

  // @ts-ignore
  return <Drawing onDraw={onDraw} {...props} skipProcessing />;
};

export default memo(Rect);
