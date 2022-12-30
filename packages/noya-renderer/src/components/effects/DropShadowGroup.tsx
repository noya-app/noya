import Sketch from 'noya-file-format';
import { Primitives } from 'noya-state';
import React, { memo, ReactNode, useMemo } from 'react';
import { Group } from '../../ComponentsContext';
import { useCanvasKit } from '../../hooks/useCanvasKit';

interface Props {
  shadow: Sketch.Shadow;
  children: ReactNode;
}

export default memo(function DropShadowGroup({ shadow, children }: Props) {
  const CanvasKit = useCanvasKit();

  const imageFilter = useMemo(
    () =>
      CanvasKit.ImageFilter.MakeDropShadowOnly(
        shadow.offsetX,
        shadow.offsetY,
        shadow.blurRadius / 2,
        shadow.blurRadius / 2,
        Primitives.color(CanvasKit, shadow.color),
        null,
      ),
    [CanvasKit, shadow],
  );

  return <Group imageFilter={imageFilter}>{children}</Group>;
});
