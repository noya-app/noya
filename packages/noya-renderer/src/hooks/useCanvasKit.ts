import type { CanvasKit } from 'canvaskit';
import { load } from '..';
import { SuspendedValue } from 'noya-utils';

let suspendedCanvasKit = new SuspendedValue<CanvasKit>(load());

export default function useCanvasKit() {
  return suspendedCanvasKit.getValueOrThrow();
}
