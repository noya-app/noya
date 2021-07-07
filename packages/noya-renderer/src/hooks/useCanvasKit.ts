import type { CanvasKit } from 'canvaskit';
import { loadCanvasKit } from '..';
import { SuspendedValue } from 'noya-utils';
// import loadSVGKit from 'noya-svgkit';

// let suspendedCanvasKit = new SuspendedValue<CanvasKit>(loadSVGKit());
let suspendedCanvasKit = new SuspendedValue<CanvasKit>(loadCanvasKit());

export default function useCanvasKit() {
  return suspendedCanvasKit.getValueOrThrow();
}
