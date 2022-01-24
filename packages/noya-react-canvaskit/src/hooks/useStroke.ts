import { Paint } from 'canvaskit';
import { useCanvasKit } from 'noya-renderer-web';
import { useMemo } from 'react';
import usePaint, { PaintParameters } from './usePaint';

export function useStroke(parameters: Omit<PaintParameters, 'style'>): Paint {
  const CanvasKit = useCanvasKit();

  const parametersWithStyle = useMemo(
    () => ({
      ...parameters,
      style: CanvasKit.PaintStyle.Stroke,
    }),
    [CanvasKit.PaintStyle.Stroke, parameters],
  );

  return usePaint(parametersWithStyle);
}
