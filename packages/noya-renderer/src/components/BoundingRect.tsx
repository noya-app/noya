import { insetRect, Rect } from 'noya-geometry';
import { useStroke } from 'noya-react-canvaskit';
import { Primitives } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Rect as RCKRect } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { useZoom } from '../ZoomContext';

export const BoundingRect = memo(function BoundingRect({
  rect,
}: {
  rect: Rect;
}) {
  const {
    canvas: { selectionStroke },
  } = useTheme().colors;
  const zoom = useZoom();

  const strokeWidth = 1 / zoom;

  const paint = useStroke({
    color: selectionStroke,
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
