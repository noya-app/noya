import Sketch from '@sketch-hq/sketch-file-format-ts';
import * as CanvasKit from 'canvaskit-wasm';
import {
  Path,
  useDeletable,
  useFill,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { memo, useMemo } from 'react';

export default memo(function SketchBorder({
  path,
  border,
}: {
  path: CanvasKit.Path;
  border: Sketch.Border;
}) {
  const { CanvasKit } = useReactCanvasKit();

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
