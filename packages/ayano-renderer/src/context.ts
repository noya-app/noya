import { ApplicationState } from 'ayano-state';
import { Canvas, CanvasKit } from 'canvaskit-wasm';

export interface Context {
  state: ApplicationState;
  CanvasKit: CanvasKit;
  canvas: Canvas;
  theme: { textColor: string; backgroundColor: string };
}
