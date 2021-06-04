import type { CanvasKit } from 'canvaskit';
import { load } from 'noya-renderer';
import { SuspendedValue } from '../utils/SuspendedValue';

let suspendedCanvasKit = new SuspendedValue<CanvasKit>(load());

export default function useCanvasKit() {
  return suspendedCanvasKit.getValueOrThrow();
}
