import React, { memo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { Rect as PRect } from 'canvaskit-types';
import { PaintNative, Rect as RNSRect } from 'noya-native-canvaskit';
import useRect from '../hooks/useRect';

interface RectProps {
  rect: PRect;
  cornerRadius?: number;
  paint: PaintNative;
}

const Rect: React.FC<RectProps> = (props) => {
  const rect = useRect(props.rect);

  const elementProps = { ...props, rect };

  const onDraw = useDrawing(
    elementProps,
    ({ canvas }, { rect, paint, cornerRadius }) => {
      if (cornerRadius) {
        canvas.drawRRect(
          {
            rect: rect as unknown as RNSRect,
            rx: cornerRadius,
            ry: cornerRadius,
          },
          paint.getRNSkiaPaint(),
        );
      } else {
        canvas.drawRect(rect as unknown as RNSRect, paint.getRNSkiaPaint());
      }
    },
  );

  // @ts-ignore
  return <Drawing onDraw={onDraw} {...elementProps} skipProcessing />;
};

export default memo(Rect);
