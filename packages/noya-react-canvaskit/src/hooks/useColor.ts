import { Color } from 'canvaskit-wasm';
import { useMemo } from 'react';
import { useReactCanvasKit } from '../contexts/ReactCanvasKitContext';
import useStable4ElementArray from './useStable4ElementArray';

export type ColorParameters = Color | number[] | string;

export default function useColor(parameters: ColorParameters): Color;
export default function useColor(
  parameters: ColorParameters | undefined,
): Color | undefined;
export default function useColor(
  parameters: ColorParameters | undefined,
): Color | undefined {
  const { CanvasKit } = useReactCanvasKit();

  const color = useMemo(() => {
    if (parameters instanceof Float32Array) return parameters;
    if (parameters instanceof Array) return new Float32Array(parameters);
    if (parameters === undefined) return parameters;
    return CanvasKit.parseColorString(parameters);
  }, [CanvasKit, parameters]);

  return useStable4ElementArray(color);
}
