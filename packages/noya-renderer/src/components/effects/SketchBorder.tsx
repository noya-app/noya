import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit';
import { Rect } from 'noya-geometry';
import { useDeletable } from 'noya-react-canvaskit';
import { Path, useCanvasKit } from 'noya-renderer';
import { Primitives } from 'noya-state';
import { memo, useMemo } from 'react';

export default memo(function SketchBorder({
  path,
  frame,
  border,
}: {
  path: CanvasKit.Path;
  frame: Rect;
  border: Sketch.Border;
}) {
  const CanvasKit = useCanvasKit();

  const paint = useMemo(() => Primitives.fill(CanvasKit, border, frame), [
    CanvasKit,
    border,
    frame,
  ]);

  const strokedPath = useMemo(
    () =>
      Primitives.getStrokedBorderPath(
        CanvasKit,
        path,
        border.thickness,
        border.position,
      ),
    [CanvasKit, border.position, border.thickness, path],
  );

  useDeletable(strokedPath);

  return <Path path={strokedPath} paint={paint} />;
});
