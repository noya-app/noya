import { Paint } from 'canvaskit';
import { useMemo } from 'react';
import { useReactCanvasKit } from '../contexts/ReactCanvasKitContext';
import usePaint, { PaintParameters } from './usePaint';

export function useStroke(parameters: Omit<PaintParameters, 'style'>): Paint {
  const { CanvasKit } = useReactCanvasKit();

  const parametersWithStyle = useMemo(
    () => ({
      ...parameters,
      style: CanvasKit.PaintStyle.Stroke,
    }),
    [CanvasKit.PaintStyle.Stroke, parameters],
  );

  return usePaint(parametersWithStyle);
}
