import { Paint } from 'canvaskit-wasm';
import { useMemo } from 'react';
import { useReactCanvasKit } from '../contexts/ReactCanvasKitContext';
import { ColorParameters } from './useColor';
import usePaint, { PaintParameters } from './usePaint';

export function useFill(parameters: Omit<PaintParameters, 'style'>): Paint {
  const { CanvasKit } = useReactCanvasKit();

  const parametersWithStyle = useMemo(
    () => ({
      ...parameters,
      style: CanvasKit.PaintStyle.Fill,
    }),
    [CanvasKit.PaintStyle.Fill, parameters],
  );

  return usePaint(parametersWithStyle);
}

export function useColorFill(color: ColorParameters): Paint {
  const { CanvasKit } = useReactCanvasKit();

  const parametersWithStyle = useMemo(
    () => ({
      color,
      style: CanvasKit.PaintStyle.Fill,
    }),
    [CanvasKit.PaintStyle.Fill, color],
  );

  return usePaint(parametersWithStyle);
}
