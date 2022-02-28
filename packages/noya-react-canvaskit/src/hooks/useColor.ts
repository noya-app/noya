import { useMemo } from 'react';

import type { CanvasKit } from 'canvaskit';
import type { Color } from 'canvaskit-types';
import { useCanvasKit } from 'noya-renderer';
import useStable4ElementArray from './useStable4ElementArray';

export type ColorParameters = Color | string | undefined;
type CKColor = Color | number[] | string | undefined;

export default function useColor(
  parameters: ColorParameters,
): Color | undefined {
  const CanvasKit = useCanvasKit() as unknown as CanvasKit;

  const color = useMemo(() => {
    const c = parameters as unknown as CKColor;

    if (c instanceof Float32Array) {
      return c;
    }

    if (c instanceof Array) {
      return new Float32Array(c);
    }

    if (c === undefined) {
      return c;
    }

    return CanvasKit.parseColorString(c as string);
  }, [CanvasKit, parameters]);

  return useStable4ElementArray(color) as unknown as Color;
}
