import { useMemo } from 'react';

import { Color } from 'canvaskit-types';
import { useCanvasKit } from 'noya-renderer';

export type ColorParameters = Color | string | undefined;

export default function useColor(
  parameters: ColorParameters,
): Color | undefined {
  const CanvasKit = useCanvasKit();

  const color = useMemo(() => {
    if (typeof parameters === 'string') {
      return CanvasKit.parseColorString(parameters);
    }

    return parameters;
  }, [CanvasKit, parameters]);

  return color;
}
