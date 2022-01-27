import React, { memo, useMemo } from 'react';

import { Paint } from 'canvaskit';
import { Rect as RectType } from 'packages/noya-geometry';
import { Rect as SkiaRect } from '@shopify/react-native-skia';
import { RectParameters } from '../hooks/useRect';

// TODO: move to shared directory f.e. PropTypes
// To avoid doubling the type
interface RectProps {
  rect: RectParameters;
  cornerRadius?: number;
  paint: Paint;
}

// TODO: move to noya-geometry
const convertTLBRArrayToXYWH = (inRect: Float32Array): RectType => {
  const [top, left, bottom, right] = inRect;
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

const Rect: React.FC<RectProps> = (props) => {
  const { rect } = props;

  const { x, y, width, height } = useMemo(
    () => convertTLBRArrayToXYWH(rect),
    [rect],
  );

  return (
    <SkiaRect x={x} y={y} width={width} height={height} color="lightblue" />
  );
};

export default memo(Rect);
