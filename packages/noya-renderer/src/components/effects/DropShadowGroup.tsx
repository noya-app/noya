import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useReactCanvasKit } from 'noya-react-canvaskit';
import { Group, Primitives } from 'noya-renderer';
import React, { memo, ReactNode, useMemo } from 'react';

interface Props {
  shadow: Sketch.Shadow;
  children: ReactNode;
}

export default memo(function DropShadowGroup({ shadow, children }: Props) {
  const { CanvasKit } = useReactCanvasKit();

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
