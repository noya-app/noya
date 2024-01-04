import { Sketch } from '@noya-app/noya-file-format';
import { Rect } from '@noya-app/noya-graphics';
import { useDeletable } from 'noya-react-canvaskit';
import { Primitives } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { useRenderingMode } from '../../RenderingModeContext';
import { useCanvasKit } from '../../hooks/useCanvasKit';

interface Props {
  layer: Sketch.Slice;
}

export default memo(function SketchSlice({ layer }: Props) {
  const renderingMode = useRenderingMode();
  const CanvasKit = useCanvasKit();
  const primaryColor = useTheme().colors.canvas.sliceOutline;

  const paint = useMemo(() => {
    const paint = new CanvasKit.Paint();
    paint.setColor(CanvasKit.parseColorString(primaryColor));
    paint.setPathEffect(CanvasKit.PathEffect.MakeDash([4, 2]));
    paint.setStyle(CanvasKit.PaintStyle.Stroke);
    paint.setStrokeWidth(1);
    return paint;
  }, [CanvasKit, primaryColor]);

  useDeletable(paint);

  const rect = Primitives.rect(CanvasKit, layer.frame);

  if (renderingMode === 'static') return null;

  return <Rect paint={paint} rect={rect} />;
});
