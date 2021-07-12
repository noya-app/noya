import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useDeletable } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import { useMemo } from 'react';
import { Primitives } from 'noya-state';

export function useTintColorFilter(tintColor: Sketch.Color | undefined) {
  const CanvasKit = useCanvasKit();

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
