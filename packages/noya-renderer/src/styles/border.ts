import Sketch from '@sketch-hq/sketch-file-format-ts';
import type { Paint, Path } from 'canvaskit-wasm';
import { Context } from '../context';

export function renderBorderPath(
  context: Context,
  paint: Paint,
  path: Path,
  position: Sketch.BorderPosition,
) {
  const { CanvasKit, canvas } = context;

  let originalThickness = paint.getStrokeWidth();

  canvas.save();

  // To change border position, we first draw the path and then
  // set it as the clip path. Then, increase the paint size by
  // 2x to compensate for the part of the path that gets cut out
  //
  // See: https://groups.google.com/g/skia-discuss/c/fE7qzKejMng
  switch (position) {
    case Sketch.BorderPosition.Outside:
      paint.setStrokeWidth(originalThickness * 2);
      canvas.clipPath(path, CanvasKit.ClipOp.Difference, true);
      break;
    case Sketch.BorderPosition.Center:
      break;
    case Sketch.BorderPosition.Inside:
      paint.setStrokeWidth(originalThickness * 2);
      canvas.clipPath(path, CanvasKit.ClipOp.Intersect, true);
      break;
  }

  canvas.drawPath(path, paint);
  canvas.restore();

  paint.setStrokeWidth(originalThickness);
}
