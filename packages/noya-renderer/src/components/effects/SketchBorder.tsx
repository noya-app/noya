import React, { memo, useMemo } from 'react';

import { Rect } from 'noya-geometry';
import Sketch from 'noya-file-format';
import * as CanvasKit from 'canvaskit';
import { Primitives } from 'noya-state';
import { useDeletable } from 'noya-react-canvaskit';
import { useCanvasKit } from '../../hooks/useCanvasKit';
import { Path } from '../../ComponentsContext';

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
