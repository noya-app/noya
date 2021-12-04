import Sketch from 'noya-file-format';
import * as CanvasKit from 'canvaskit';
import { Rect } from 'noya-geometry';
import { useDeletable } from 'noya-react-canvaskit';
import { Path, useCanvasKit } from 'noya-renderer';
import { lineCapStyle, lineJoinStyle, Primitives } from 'noya-state';
import { memo, useMemo } from 'react';

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

  const paint = useMemo(() => {
    const paint = Primitives.fill(CanvasKit, border, frame);

    if (borderOptions.isEnabled) {
      paint.setStrokeJoin(
        lineJoinStyle(CanvasKit, borderOptions.lineJoinStyle),
      );
      paint.setStrokeCap(lineCapStyle(CanvasKit, borderOptions.lineCapStyle));
    }
    return paint;
  }, [CanvasKit, border, frame, borderOptions]);

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
