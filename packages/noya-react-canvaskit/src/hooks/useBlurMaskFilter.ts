import { BlurStyle, MaskFilter } from 'canvaskit-wasm';
import { useMemo } from 'react';
import { useReactCanvasKit } from '../contexts/ReactCanvasKitContext';
import useDeletable from './useDeletable';

export type BlurMaskFilterParameters = {
  style: BlurStyle;
  sigma: number;
  respectCTM: boolean;
};

export default function useBlurMaskFilter(
  parameters: BlurMaskFilterParameters,
): MaskFilter {
  const { CanvasKit } = useReactCanvasKit();

  const maskFilter = useMemo(
    () =>
      CanvasKit.MaskFilter.MakeBlur(
        parameters.style,
        parameters.sigma,
        parameters.respectCTM,
      ),
    [
      CanvasKit.MaskFilter,
      parameters.respectCTM,
      parameters.sigma,
      parameters.style,
    ],
  );

  return useDeletable(maskFilter);
}
