import * as CanvasKit from 'canvaskit';
import Sketch from 'noya-file-format';
import { Rect } from 'noya-geometry';
import { useDeletable } from 'noya-react-canvaskit';
import { Path, useCanvasKit } from 'noya-renderer';
import { Primitives } from 'noya-state';
import React, { memo, useMemo } from 'react';

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
