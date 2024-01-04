import { Sketch } from '@noya-app/noya-file-format';
import { Group } from '@noya-app/noya-graphics';
import { DropShadow } from 'noya-react-canvaskit';
import { Primitives } from 'noya-state';
import React, { memo, ReactNode, useMemo } from 'react';
import { useCanvasKit } from '../../hooks/useCanvasKit';

interface Props {
  shadow: Sketch.Shadow;
  children: ReactNode;
}

export default memo(function DropShadowGroup({ shadow, children }: Props) {
  const CanvasKit = useCanvasKit();

  const imageFilter = useMemo(
    (): DropShadow => ({
      type: 'dropShadow',
      color: Primitives.color(CanvasKit, shadow.color),
      offset: { x: shadow.offsetX, y: shadow.offsetY },
      radius: shadow.blurRadius / 2,
    }),
    [CanvasKit, shadow],
  );

  return <Group imageFilter={imageFilter}>{children}</Group>;
});
