import { CanvasKit } from 'canvaskit';
import { SkiaCanvasKit } from './SkiaCanvasKit';
import { createSkiaPath } from './SkiaPath';

let loadingPromise: Promise<CanvasKit> | undefined;

export function loadSkiaCanvasKit() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    // TODO: move to SkiaCanvasKit if not necessary here
    (SkiaCanvasKit as any).Path = createSkiaPath();
    resolve(SkiaCanvasKit);
  });

  return loadingPromise;
}
