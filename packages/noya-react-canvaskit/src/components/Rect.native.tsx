import React, { memo, useRef, useEffect, useMemo } from 'react';

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
const LTRBArrayToIRect = (inRect: Float32Array): RectType => {
  const [left, top, right, bottom] = inRect;

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

const Rect: React.FC<RectProps> = (props) => {
  const { rect, paint } = props;

  const skiaPaint = useRef(paint._paint);

  useEffect(() => {
    skiaPaint.current = paint._paint;
  }, [paint._paint]);

  const { x, y, width, height } = useMemo(() => LTRBArrayToIRect(rect), [rect]);

  return (
    <SkiaRect x={x} y={y} width={width} height={height} paint={skiaPaint} />
  );
};

export default memo(Rect);
