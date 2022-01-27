import { CanvasKit } from 'canvaskit';
import { SkiaKit } from './SkiaKit';

let loadingPromise: Promise<CanvasKit> | undefined;

export default function loadCanvasKit() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    // TODO: return real canvaskit for mobile
    resolve(SkiaKit);
  });

  return loadingPromise;
}
