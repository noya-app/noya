import { Sketch } from '@noya-app/noya-file-format';
import { Rect } from '@noya-app/noya-geometry';
import * as CanvasKit from 'canvaskit';
import { useDeletable } from 'noya-react-canvaskit';
import { Primitives } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { Path } from '../../ComponentsContext';
import { useCanvasKit } from '../../hooks/useCanvasKit';

export default memo(function SketchBorder({
  path,
  frame,
  border,
  borderOptions,
}: {
  path: CanvasKit.Path;
  frame: Rect;
  border: Sketch.Border;
  borderOptions: Sketch.BorderOptions;
}) {
  const CanvasKit = useCanvasKit();

  const paint = useMemo(
    () => Primitives.fill(CanvasKit, border, frame),
    [CanvasKit, border, frame],
  );

  const strokedPath = useMemo(
    () =>
      Primitives.getStrokedBorderPath(
        CanvasKit,
        path,
        border.thickness,
        border.position,
        borderOptions.lineCapStyle,
        borderOptions.lineJoinStyle,
      ),
    [
      CanvasKit,
      border.position,
      border.thickness,
      borderOptions.lineCapStyle,
      borderOptions.lineJoinStyle,
      path,
    ],
  );

  useDeletable(strokedPath);

  return <Path path={strokedPath} paint={paint} />;
});
