import type { CanvasKit } from 'canvaskit-wasm';
import { load } from 'sketch-canvas';
import { SuspendedValue } from '../utils/SuspendedValue';

let suspendedCanvasKit = new SuspendedValue<CanvasKit>(load());

export default function useCanvasKit() {
  return suspendedCanvasKit.getValueOrThrow();
}
