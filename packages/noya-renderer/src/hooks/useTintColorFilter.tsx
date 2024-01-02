import { Sketch } from '@noya-app/noya-file-format';
import { useDeletable } from 'noya-react-canvaskit';
import { Primitives } from 'noya-state';
import { useMemo } from 'react';
import { useCanvasKit } from './useCanvasKit';

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
