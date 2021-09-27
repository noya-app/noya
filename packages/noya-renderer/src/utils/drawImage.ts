import { Canvas, CanvasKit, Image } from 'canvaskit';
import { Size } from 'noya-geometry';
import { Base64 } from 'noya-utils';

export function drawImage(
  CanvasKit: CanvasKit,
  size: Size,
  callback: (canvas: Canvas) => void,
): Image | undefined {
  const surface = CanvasKit.MakeSurface(size.width, size.height);

  if (!surface) return;

  const canvas = surface.getCanvas();

  if (!canvas) return;

  callback(canvas);

  const image = surface.makeImageSnapshot();

  surface.delete();

  return image;
}

export function drawBase64PNG(
  CanvasKit: CanvasKit,
  size: Size,
  callback: (canvas: Canvas) => void,
) {
  const image = drawImage(CanvasKit, size, callback);

  if (!image) return;

  const bytes = image.encodeToBytes(CanvasKit.ImageFormat.PNG, 100);

  if (!bytes) return;

  return Base64.encode(bytes);
}
