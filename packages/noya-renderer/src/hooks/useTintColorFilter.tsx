import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useDeletable, useReactCanvasKit } from 'noya-react-canvaskit';
import { useMemo } from 'react';
import { Primitives } from '..';

export function useTintColorFilter(tintColor: Sketch.Color | undefined) {
  const { CanvasKit } = useReactCanvasKit();

  const colorFilter = useMemo(() => {
    return tintColor
      ? CanvasKit.ColorFilter.MakeBlend(
          Primitives.color(CanvasKit, tintColor),
          CanvasKit.BlendMode.SrcIn,
        )
      : undefined;
  }, [CanvasKit, tintColor]);

  useDeletable(colorFilter);

  return colorFilter;
}
