import {
  Paint,
  PaintStyle,
  MaskFilter,
  StrokeCap,
  StrokeJoin,
} from 'canvaskit-types';
import { useCanvasKit } from 'noya-renderer';
import { useMemo } from 'react';
import useColor, { ColorParameters } from './useColor';
import useDeletable from './useDeletable';

export interface PaintParameters {
  color: ColorParameters;
  opacity?: number;
  style: PaintStyle;
  strokeWidth?: number;
  antiAlias?: boolean;
  maskFilter?: MaskFilter;
  strokeJoin?: StrokeJoin;
  strokeCap?: StrokeCap;
}

function isPaint(value: Paint | PaintParameters): value is Paint {
  return 'delete' in value;
}

export default function usePaint(parameters: PaintParameters | Paint): Paint {
  const CanvasKit = useCanvasKit();

  const maybePaintObject = isPaint(parameters) ? parameters : undefined;

  const maybeParameters = useStablePaintParameters(
    !isPaint(parameters) ? parameters : undefined,
  );

  const paint = useMemo(() => {
    if (!maybeParameters) return;
    const paint = new CanvasKit.Paint();
    paint.setColor(maybeParameters.color);
    paint.setStyle(maybeParameters.style);
    paint.setAntiAlias(maybeParameters.antiAlias ?? true);
    paint.setStrokeWidth(maybeParameters.strokeWidth ?? 1);
    if (maybeParameters.strokeJoin)
      paint.setStrokeJoin(maybeParameters.strokeJoin);
    if (maybeParameters.strokeCap)
      paint.setStrokeCap(maybeParameters.strokeCap);
    if (maybeParameters.opacity !== undefined && maybeParameters.opacity < 1) {
      paint.setAlphaf(maybeParameters.opacity);
    }
    if (maybeParameters.maskFilter) {
      paint.setMaskFilter(maybeParameters.maskFilter);
    }
    return paint;
  }, [maybeParameters, CanvasKit.Paint]);

  const deletablePaint = useDeletable(paint);
  return maybePaintObject ?? deletablePaint!;
}

function useStablePaintParameters(parameters: PaintParameters | undefined) {
  const maybeColor = useColor(parameters?.color);

  const paint = useMemo(
    () => {
      if (!maybeColor || !parameters) return;

      return {
        color: maybeColor!,
        style: parameters.style,
        antiAlias: parameters.antiAlias,
        strokeWidth: parameters.strokeWidth,
        maskFilter: parameters.maskFilter,
        opacity: parameters.opacity,
        strokeJoin: parameters.strokeJoin,
        strokeCap: parameters.strokeCap,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      maybeColor,
      parameters?.style,
      parameters?.antiAlias,
      parameters?.strokeWidth,
      parameters?.maskFilter,
      parameters?.opacity,
      parameters?.strokeJoin,
      parameters?.strokeCap,
    ],
  );

  return paint;
}
