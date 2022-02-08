import { CanvasKit } from 'canvaskit';

const canvasKit: CanvasKit = {};
let loadingPromise: Promise<CanvasKit> | undefined;

export default function loadCanvasKit() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    // TODO: return real canvaskit for mobile
    resolve(canvasKit);
  });

  return loadingPromise;
}
