import React from 'react';
import {
  Rect as SkiaRect,
  Paint as SkiaPaint,
} from '@shopify/react-native-skia';

import { Rect } from '../../types';

const RectElement: React.FC<{ rect: Rect }> = (props) => {
  const { rect } = props;
  const { position, size, color, stroke } = rect;

  return (
    <SkiaRect
      x={position.x}
      y={position.y}
      color={color}
      width={size.width}
      height={size.height}
    >
      {!!stroke && stroke.width && (
        <SkiaPaint
          style="stroke" // eslint-disable-line
          color={stroke.color || '#000'}
          strokeWidth={stroke.width}
        />
      )}
    </SkiaRect>
  );
};

export default React.memo(RectElement);
