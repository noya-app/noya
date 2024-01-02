import { insetRect, Rect } from '@noya-app/noya-geometry';
import { useStroke } from 'noya-react-canvaskit';
import { Primitives } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Rect as RCKRect } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { useZoom } from '../ZoomContext';

export const BoundingRect = memo(function BoundingRect({
  rect,
  strokeColor: strokeColorProp,
}: {
  rect: Rect;
  strokeColor?: string;
}) {
  const {
    canvas: { selectionStroke },
  } = useTheme().colors;
  const zoom = useZoom();
  const strokeColor = strokeColorProp || selectionStroke;
  const strokeWidth = 1 / zoom;

  const paint = useStroke({
    color: strokeColor,
    strokeWidth,
  });

  const CanvasKit = useCanvasKit();
  const alignedRect = useMemo(
    () =>
      Primitives.rect(
        CanvasKit,
        insetRect(rect, strokeWidth / 2, strokeWidth / 2),
      ),
    [CanvasKit, rect, strokeWidth],
  );

  return <RCKRect rect={alignedRect} paint={paint} />;
});
