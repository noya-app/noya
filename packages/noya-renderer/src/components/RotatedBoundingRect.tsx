import { useApplicationState } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { useDeletable, useFill } from 'noya-react-canvaskit';
import { Primitives, Selectors } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Path } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { useZoom } from '../ZoomContext';

export const RotatedBoundingRect = memo(function RotatedBoundingRect({
  layerId,
}: {
  layerId: string;
}) {
  const CanvasKit = useCanvasKit();
  const [state] = useApplicationState();
  const {
    canvas: { dragHandleStroke },
  } = useTheme().colors;
  const zoom = useZoom();

  const strokeWidth = 2 / zoom;
  const paint = useFill({
    color: dragHandleStroke,
    strokeWidth,
  });

  const page = Selectors.getCurrentPage(state);
  const boundingPoints = useMemo(
    () =>
      Selectors.getBoundingPoints(page, layerId, {
        groups: 'childrenOnly',
        includeHiddenLayers: true,
      }),
    [page, layerId],
  );

  const path = useMemo(() => {
    const path = new CanvasKit.Path();
    path.moveTo(boundingPoints[0].x, boundingPoints[0].y);
    path.lineTo(boundingPoints[1].x, boundingPoints[1].y);
    path.lineTo(boundingPoints[2].x, boundingPoints[2].y);
    path.lineTo(boundingPoints[3].x, boundingPoints[3].y);
    path.close();

    const outer = Primitives.getStrokedBorderPath(
      CanvasKit,
      path,
      strokeWidth / 2,
      Sketch.BorderPosition.Inside,
      Sketch.LineCapStyle.Butt,
      Sketch.LineJoinStyle.Miter,
    );

    path.delete();

    return outer;
  }, [CanvasKit, boundingPoints, strokeWidth]);

  useDeletable(path);

  return <Path path={path} paint={paint} />;
});
