import Sketch from '@sketch-hq/sketch-file-format-ts';
import memoize from 'ayano-state/src/utils/memoize';
import type { CanvasKit } from 'canvaskit-wasm';
import { v4 as uuid } from 'uuid';
import { Context } from '../context';
import * as Primitives from '../primitives';

export type { Context };
export { uuid, Primitives };

const decodeImage = memoize(
  (
    CanvasKit: CanvasKit,
    data: ArrayBuffer,
  ): ReturnType<CanvasKit['MakeImageFromEncoded']> => {
    return CanvasKit.MakeImageFromEncoded(data);
  },
);

export function renderBitmap(context: Context, layer: Sketch.Bitmap) {
  const { state, canvas, CanvasKit } = context;

  const ref = state.sketch.images[layer.image._ref];

  if (!ref) {
    console.log('Missing image ref', layer.image);
    return;
  }

  const image = decodeImage(CanvasKit, ref);
  // const image = CanvasKit.MakeImageFromEncoded(ref);

  if (!image) {
    console.log('Failed to decode image', layer.image);
    return;
  }

  const paint = new CanvasKit.Paint();

  // canvas.drawImageRect(
  //   image,
  //   CanvasKit.XYWHRect(0, 0, image.width(), image.height()),
  //   Primitives.rect(CanvasKit, layer.frame),
  //   paint,
  //   true,
  // );

  // Number parameters "B" and "C" are for tweaking the cubic resampler:
  // https://api.skia.org/SkSamplingOptions_8h_source.html
  canvas.drawImageRectCubic(
    image,
    CanvasKit.XYWHRect(0, 0, image.width(), image.height()),
    Primitives.rect(CanvasKit, layer.frame),
    0,
    0,
    paint,
  );
}
