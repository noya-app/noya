import { CanvasKit } from 'canvaskit';
import { SkiaCanvasKit } from './SkiaCanvasKit';

let loadingPromise: Promise<CanvasKit> | undefined;

export function loadSkiaCanvasKit() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    resolve(SkiaCanvasKit);
  });

  return loadingPromise;
}
