import type { CanvasKit } from 'canvaskit';
import { load } from 'noya-renderer';
import { SuspendedValue } from 'noya-utils';
// import SVGKit from 'noya-svgkit';

// let suspendedCanvasKit = new SuspendedValue<CanvasKit>(Promise.resolve(SVGKit));
let suspendedCanvasKit = new SuspendedValue<CanvasKit>(load());

export default function useCanvasKit() {
  return suspendedCanvasKit.getValueOrThrow();
}
