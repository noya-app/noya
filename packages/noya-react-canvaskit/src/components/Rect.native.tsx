import React, { memo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { Rect as PRect } from 'canvaskit-types';
import { PaintNative, Rect as RNSRect } from 'noya-native-canvaskit';
import useRect from '../hooks/useRect.native';

interface RectProps {
  rect: PRect;
  cornerRadius?: number;
  paint: PaintNative;
}

const Rect: React.FC<RectProps> = (props) => {
  const rect = useRect(props.rect as unknown as RNSRect);

  const elementProps = { ...props, rect };

  const onDraw = useDrawing(
    elementProps,
    ({ canvas }, { rect, paint, cornerRadius }) => {
      if (cornerRadius) {
        canvas.drawRRect(
          { rect, rx: cornerRadius, ry: cornerRadius },
          paint.getRNSkiaPaint(),
        );
      } else {
        canvas.drawRect(rect, paint.getRNSkiaPaint());
      }
    },
  );

  // @ts-ignore
  return <Drawing onDraw={onDraw} {...elementProps} skipProcessing />;
};

export default memo(Rect);
