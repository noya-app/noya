import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit';
import { useDeletable, useFill } from 'noya-react-canvaskit';
import { Path, useCanvasKit } from 'noya-renderer';
import { Primitives } from 'noya-state';
import { memo, useMemo } from 'react';

export default memo(function SketchBorder({
  path,
  border,
}: {
  path: CanvasKit.Path;
  border: Sketch.Border;
}) {
  const CanvasKit = useCanvasKit();

  const paint = useFill({
    color: Primitives.color(CanvasKit, border.color),
  });

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
